import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function WishlistPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => { const { data } = await api.get('/wishlist'); return data.items; },
  });

  const removeItem = useMutation({
    mutationFn: (id) => api.delete(`/wishlist/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wishlist'] }); toast.success('تمت الإزالة من المفضلة'); },
  });

  const items = data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">❤️ المفضلة</h1>

      {isLoading ? (
        <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">❤️</span>
          <p className="text-gray-500 mb-2">لا توجد عناصر في المفضلة</p>
          <p className="text-sm text-gray-400 mb-6">أضيفي خدماتكِ المفضلة ليسهل الوصول إليها</p>
          <Link to="/services" className="btn-primary inline-block">تصفحي الخدمات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card-hover">
              {item.service && (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800">{item.service.titleJson?.ar}</h3>
                    <button onClick={() => removeItem.mutate(item.id)} className="text-red-400 hover:text-red-600">❤️</button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-primary-600">{Number(item.service.basePrice).toLocaleString('ar-SA')} ر.س</span>
                    <span className="text-gray-400">⏱ {item.service.durationMin} د</span>
                  </div>
                  <Link to={`/services/${item.service.id}`} className="text-xs text-primary-600 hover:text-primary-700 mt-2 block">عرض التفاصيل ←</Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
