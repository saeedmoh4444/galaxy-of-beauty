import { customerProcedure, router } from '../trpc';

const CONTENT = [
  { id: 1, type: 'tutorial', title: 'روتين عناية صباحي', technician: 'د. ليلى', emoji: '✨', relevance: 95 },
  { id: 2, type: 'product', title: 'واقي شمس SPF50', brand: 'La Roche-Posay', emoji: '☀️', relevance: 90 },
  { id: 3, type: 'service', title: 'تنظيف بشرة عميق', price: 200, emoji: '🧖‍♀️', relevance: 88 },
  { id: 4, type: 'blog', title: 'أفضل منتجات العناية ٢٠٢٦', emoji: '📝', relevance: 85 },
  { id: 5, type: 'offer', title: 'خصم ٣٠٪ على المساج', emoji: '💆‍♀️', relevance: 82 },
  { id: 6, type: 'short', title: 'طريقة تطبيق السيروم', technician: 'نورة', emoji: '📹', relevance: 78 },
];

export const personalizedFeedRouter = router({
  feed: customerProcedure.query(() => ({
    items: CONTENT,
    categories: ['متابَع', 'مقترح', 'رائج'],
    interests: ['skincare', 'makeup', 'wellness'],
  })),
  refresh: customerProcedure.mutation(async () => ({ refreshed: true, newItems: 3 })),
});
