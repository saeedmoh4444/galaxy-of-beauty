import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const COMMANDS: Record<string, string> = {
  حجز: 'لحجز خدمة، أرسلي: حجز [اسم الخدمة] [التاريخ] [الوقت]\nمثال: حجز مكياج ٣٠ يوليو ١٠ صباحاً',
  خدمات: 'خدماتنا: 💄 مكياج | ✨ عناية بالبشرة | 💇‍♀️ شعر | 💅 أظافر | 💆‍♀️ مساج',
  مساعدة:
    'الأوامر المتاحة:\n📅 حجز — حجز خدمة\n📋 خدمات — قائمة الخدمات\n💰 أسعار — الأسعار\n📍 فروع — مواقعنا\n📞 تواصل — خدمة العملاء',
  أسعار:
    '💰 الأسعار التقريبية:\n💄 مكياج: من ٢٠٠ ر.س\n✨ تنظيف بشرة: من ١٥٠ ر.س\n💇‍♀️ تسريحة: من ١٥٠ ر.س\n💅 مانيكير: من ١٠٠ ر.س\n💆‍♀️ مساج: من ٢٠٠ ر.س',
};

export const whatsappBotRouter = router({
  webhook: publicProcedure
    .input(z.object({ from: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      const msg = input.message.trim();
      let reply = '';
      for (const [keyword, response] of Object.entries(COMMANDS)) {
        if (msg.includes(keyword)) {
          reply = response;
          break;
        }
      }
      if (!reply)
        reply =
          '👋 أهلاً بكِ في جالكسي بيوتي!\n\nأرسلي: حجز | خدمات | أسعار | مساعدة\n\nأو زوري موقعنا لحجز مباشر: galaxyofbeauty.sa';
      return { reply, to: input.from };
    }),
  commands: publicProcedure.query(() => Object.keys(COMMANDS)),
});
