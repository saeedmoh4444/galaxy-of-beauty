import { z } from 'zod';
import { OPENAI_API_URL, OPENAI_MODEL, EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { customerProcedure, customerMutation, router, requireFeatureFlag } from '../trpc';

const FALLBACK_RESPONSES: Record<string, string> = {
  روتين:
    'بناءً على نوع بشرتكِ، أقترح: صباحاً — غسول لطيف + تونر + سيروم فيتامين C + مرطب + واقي شمس. مساءً — مزيل مكياج + غسول + تونر + ريتينول + كريم ليلي.',
  بشرة: 'للعناية بالبشرة الدهنية: استخدمي غسول جل، تونر خالي من الكحول، سيروم نيياسيناميد، ومرطب خفيف. للبشرة الجافة: غسول كريمي، تونر مرطب، سيروم حمض الهيالورونيك، ومرطب غني.',
  مكياج:
    'لإطلالة يومية: كريم BB + كونسيلر + أحمر خدود كريمي + ماسكارا + ملمع شفاه. للمناسبات: أضيفي برايمر + كريم أساس + ظلال عيون + آيلاينر.',
  شعر: 'للعناية بالشعر: اغسلي شعركِ مرتين أسبوعياً، استخدمي بلسم بعد كل غسلة، وماسك مرة أسبوعياً. تجنبي الحرارة العالية واستخدمي واقي حرارة.',
  زواج: 'خطة العناية للعروس: قبل ٦ أشهر — روتين عناية يومي. قبل ٣ أشهر — جلسات تنظيف بشرة شهرية. قبل شهر — تجربة مكياج وتسريحة. قبل أسبوع — مانيكير وباديكير. قبل يوم — مساج استرخاء.',
  صيف: 'للعناية الصيفية: واقي شمس SPF50+ ضروري يومياً، مرطب خفيف، ماء بكثرة، تجنبي الشمس من ١٠ صباحاً لـ ٤ مساءً، واستخدمي سيروم فيتامين C.',
  default:
    'شكراً لسؤالكِ! يمكنني مساعدتكِ في: روتين العناية، نصائح البشرة، المكياج، العناية بالشعر، تحضيرات الزواج، والعناية الصيفية. ما الموضوع الذي تهتمين به؟ ',
};

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.AI_CHAT);

export const aiAssistantRouter = router({
  // Mutation: asking a question is an on-demand action, not a cached fetch —
  // clients use useMutation and cannot treat the answer as a query result
  ask: customerMutation
    .use(flag)
    .input(z.object({ question: z.string().min(2).max(500) }))
    .mutation(async ({ input }) => {
      const q = input.question;
      let answer = '';
      for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
        if (q.includes(keyword)) {
          answer = response;
          break;
        }
      }

      // Try OpenAI for unmatched questions
      if (!answer) {
        try {
          const key = process.env['OPENAI_API_KEY'];
          if (key) {
            const res = await fetch(OPENAI_API_URL, {
              method: 'POST',
              headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are a Saudi beauty expert assistant. Answer in Arabic. Keep answers under 200 words. Topic: skincare, makeup, hair, wellness.',
                  },
                  { role: 'user', content: q },
                ],
                max_tokens: 300,
              }),
            });
            const data = (await res.json()) as Record<string, unknown>;
            const content = (data['choices'] as Array<Record<string, unknown>>)?.[0]?.[
              'message'
            ] as Record<string, unknown> | undefined;
            if (content?.['content']) answer = content['content'] as string;
          }
        } catch {
          /* use fallback */
        }
      }

      if (!answer) answer = FALLBACK_RESPONSES['default']!;

      return {
        question: q,
        answer,
        topics: Object.keys(FALLBACK_RESPONSES).filter((k) => k !== 'default'),
        aiPowered: answer !== FALLBACK_RESPONSES['default'],
      };
    }),
  topics: customerProcedure.use(flag).query(() =>
    Object.keys(FALLBACK_RESPONSES)
      .filter((k) => k !== 'default')
      .map((k) => ({
        key: k,
        emoji: { روتين: '', بشرة: '', مكياج: '', شعر: '‍️', زواج: '', صيف: '️' }[k] ?? '',
        label: k,
      })),
  ),
});
