import { adminProcedure, customerProcedure, router } from '../trpc';

const FORECAST = {
  nextWeek: {
    predictedBookings: 380,
    confidence: 85,
    peakDay: 'الخميس',
    peakTime: '٤-٨ مساءً',
    recommendations: ['زيادة عدد الفنيات يوم الخميس', 'توفير عروض للأيام الهادئة'],
  },
  nextMonth: {
    predictedBookings: 1650,
    confidence: 78,
    growth: 12,
    topServices: ['مكياج', 'تنظيف بشرة', 'مساج'],
  },
  byService: [
    { name: 'مكياج', currentDemand: 85, trend: 'up', prediction: '+١٥٪' },
    { name: 'تنظيف بشرة', currentDemand: 72, trend: 'stable', prediction: '+٥٪' },
    { name: 'مساج', currentDemand: 68, trend: 'up', prediction: '+١٠٪' },
    { name: 'مانيكير', currentDemand: 55, trend: 'down', prediction: '-٣٪' },
  ],
};

export const predictiveDemandRouter = router({
  forecast: adminProcedure.query(() => FORECAST),
  myInsights: customerProcedure.query(() => ({
    bestTimeToBook: 'الثلاثاء ١٠ صباحاً — أقل ازدحاماً',
    popularThisWeek: ['مكياج طبيعي', 'تنظيف بشرة', 'مساج استرخائي'],
    tip: 'احجزي قبل ٣ أيام للحصول على موعدكِ المفضل ',
  })),
});
