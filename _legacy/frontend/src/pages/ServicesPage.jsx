import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategories, useServices } from '../hooks/useCatalog';
import { useDebounce } from '../hooks/useDebounce';
import { GridSkeleton } from '../components/ui/SkeletonCard';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Resolve categorySlug to categoryId
  const activeCategorySlug = searchParams.get('categorySlug');
  const activeCategoryId = activeCategorySlug ? undefined : (searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined);

  // Fetch categories to resolve slug→id
  const { data: categories } = useCategories();
  const resolvedCategoryId = useMemo(() => {
    if (activeCategorySlug && categories) {
      const find = (cats, slug) => { for (const c of cats) { if (c.slug === slug) return c.id; if (c.children) { const r = find(c.children, slug); if (r) return r; } } return null; };
      return find(categories, activeCategorySlug);
    }
    return activeCategoryId;
  }, [activeCategorySlug, activeCategoryId, categories]);

  // Sync debounced search to URL
  useEffect(() => { updateParams({ search: debouncedSearch || undefined }); }, [debouncedSearch]);

  const activeSearch = searchParams.get('search') || undefined;
  const activeSort = searchParams.get('sortBy') || 'newest';
  const activePage = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  const { data: servicesData, isLoading } = useServices({
    categoryId: resolvedCategoryId,
    search: activeSearch,
    sortBy: activeSort,
    page: activePage,
    limit: 12,
    minPrice,
    maxPrice,
    includeVariants: true,
  });

  // Find active category for display
  const activeCategoryName = useMemo(() => {
    if (!resolvedCategoryId || !categories) return null;
    const find = (cats) => { for (const c of cats) { if (c.id === resolvedCategoryId) return c.nameJson?.ar; if (c.children) { const r = find(c.children); if (r) return r; } } return null; };
    return find(categories);
  }, [resolvedCategoryId, categories]);

  // Update URL params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset page on filter change
    if (!('page' in updates)) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput || undefined, categorySlug: undefined, page: undefined });
  };

  const handleCategoryClick = (catSlug) => {
    updateParams({ categorySlug: activeCategorySlug === catSlug ? undefined : catSlug, categoryId: undefined, page: undefined });
  };

  const services = servicesData?.services || [];
  const pagination = servicesData?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 font-display">
          {activeCategoryName || 'جميع الخدمات'}
        </h1>
        {activeCategoryName && (
          <button
            onClick={() => updateParams({ categorySlug: undefined, categoryId: undefined })}
            className="text-sm text-primary-600 hover:text-primary-700 mt-1"
          >
            ← عرض جميع الخدمات
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="card sticky top-20 space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">بحث</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحثي عن خدمة..."
                  className="input-field text-sm py-2 flex-1"
                />
                <button type="submit" className="btn-primary text-sm py-2 px-3">
                  بحث
                </button>
              </div>
            </form>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">الفئات</h3>
              <div className="space-y-1">
                {categories?.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors
                        ${activeCategorySlug === cat.slug
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.nameJson?.ar}
                      {cat.children?.length > 0 && (
                        <span className="text-xs text-gray-400 mr-1">({cat.children.length})</span>
                      )}
                    </button>
                    {cat.children?.length > 0 && (
                      <div className="mr-3 space-y-1 border-r-2 border-gray-100 pr-2">
                        {cat.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleCategoryClick(child.slug)}
                            className={`w-full text-right px-3 py-1.5 rounded-lg text-xs transition-colors
                              ${activeCategorySlug === child.slug
                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            {child.nameJson?.ar}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">السعر (ر.س)</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="من"
                  className="input-field text-sm py-1.5 w-20"
                  value={minPrice || ''}
                  onChange={(e) => updateParams({ minPrice: e.target.value || undefined })}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="إلى"
                  className="input-field text-sm py-1.5 w-20"
                  value={maxPrice || ''}
                  onChange={(e) => updateParams({ maxPrice: e.target.value || undefined })}
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ترتيب حسب</h3>
              <select
                value={activeSort}
                onChange={(e) => updateParams({ sortBy: e.target.value })}
                className="input-field text-sm py-2"
              >
                <option value="newest">الأحدث</option>
                <option value="price">السعر: من الأقل</option>
                <option value="-price">السعر: من الأعلى</option>
                <option value="popularity">الأكثر طلباً</option>
                <option value="duration">المدة: الأقصر</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(activeCategorySlug || activeSearch || activeCategoryId || minPrice || maxPrice) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-red-500 hover:text-red-600"
              >
                مسح التصفية
              </button>
            )}
          </div>
        </aside>

        {/* Service Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <GridSkeleton count={6} />
          ) : services.length === 0 ? (
            <div className="card text-center py-16">
              <span className="text-5xl block mb-4">🔍</span>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم نجد خدمات تطابق بحثك. جربي تغيير معايير البحث.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <Link
                    key={svc.id}
                    to={`/services/${svc.id}`}
                    className="card-hover group cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="h-40 bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {svc.imageUrl ? (
                        <img src={svc.imageUrl} alt={svc.titleJson?.ar} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-30">
                          {svc.category?.slug?.startsWith('hair') ? '💇‍♀️' :
                           svc.category?.slug?.startsWith('nail') ? '💅' :
                           svc.category?.slug?.startsWith('skin') ? '✨' :
                           svc.category?.slug?.startsWith('makeup') ? '💄' :
                           svc.category?.slug?.startsWith('body') ? '💆‍♀️' : '🌿'}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {svc.titleJson?.ar}
                        </h3>
                        {svc.category && (
                          <p className="text-xs text-gray-400 mt-1">{svc.category.nameJson?.ar}</p>
                        )}
                      </div>
                      {svc.isPopular && (
                        <span className="badge badge-purple text-xs">الأكثر طلباً</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="font-bold text-primary-600 text-lg">
                          {Number(svc.basePrice).toLocaleString('ar-SA')} ر.س
                        </span>
                        {svc.variants?.length > 0 && (
                          <span className="text-xs text-gray-400 block">+ خيارات إضافية</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <span>⏱</span>
                        <span>{svc.durationMin} د</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: p })}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${p === activePage
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Results count */}
              <p className="text-center text-xs text-gray-400 mt-4">
                {pagination?.total || 0} خدمة متاحة
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
