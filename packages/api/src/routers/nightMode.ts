import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const NIGHT_ROUTINE = [
  {
    step: 1,
    time: '21:00',
    taskAr: 'إزالة المكياج',
    taskEn: 'Makeup Removal',
    emoji: '🧽',
    durationMin: 3,
    tip: 'استخدمي مزيل مكياج لطيف',
  },
  {
    step: 2,
    time: '21:05',
    taskAr: 'غسول الوجه',
    taskEn: 'Face Wash',
    emoji: '🧼',
    durationMin: 2,
    tip: 'دلكي بلطف بحركات دائرية',
  },
  {
    step: 3,
    time: '21:10',
    taskAr: 'تونر',
    taskEn: 'Toner',
    emoji: '💦',
    durationMin: 1,
    tip: 'طبطبي على البشرة ولا تفركي',
  },
  {
    step: 4,
    time: '21:15',
    taskAr: 'سيروم ليلي',
    taskEn: 'Night Serum',
    emoji: '🌙',
    durationMin: 2,
    tip: 'طبقي على بشرة رطبة',
  },
  {
    step: 5,
    time: '21:20',
    taskAr: 'كريم مرطب',
    taskEn: 'Moisturizer',
    emoji: '🧴',
    durationMin: 2,
    tip: 'لا تنسي منطقة الرقبة',
  },
  {
    step: 6,
    time: '21:30',
    taskAr: 'شاي أعشاب',
    taskEn: 'Herbal Tea',
    emoji: '🍵',
    durationMin: 10,
    tip: 'البابونج يساعد على الاسترخاء',
  },
  {
    step: 7,
    time: '21:45',
    taskAr: 'تأمل أو قراءة',
    taskEn: 'Meditation/Reading',
    emoji: '📖',
    durationMin: 15,
    tip: 'ابتعدي عن الشاشات قبل النوم',
  },
  {
    step: 8,
    time: '22:15',
    taskAr: 'نوم هانئ',
    taskEn: 'Sweet Dreams',
    emoji: '😴',
    durationMin: 480,
    tip: '٧-٨ ساعات نوم لبشرة صحية',
  },
];

export const nightModeRouter = router({
  routine: customerProcedure.query(() => NIGHT_ROUTINE),
  tips: customerProcedure.query(() => [
    'خفتي الأضواء قبل ساعة من النوم',
    'درجة حرارة الغرفة المثالية ١٨-٢٢ درجة',
    'تجنبي الكافيين بعد الساعة ٤ مساءً',
    'استخدمي وسادة حرير لحماية الشعر والبشرة',
  ]),

  mySettings: customerProcedure.query(async ({ ctx }) => {
    const s = await prisma.nightModeSetting.findUnique({ where: { userId: ctx.user.id } });
    return s || { enabled: false, startTime: '21:00' };
  }),

  saveSettings: customerProcedure
    .input(z.object({ enabled: z.boolean(), startTime: z.string() }))
    .mutation(async ({ ctx, input }) =>
      prisma.nightModeSetting.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input },
      }),
    ),
});
