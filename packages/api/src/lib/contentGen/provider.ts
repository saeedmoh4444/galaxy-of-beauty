/**
 * 3.4 — content generation provider abstraction.
 *
 * OpenAI when OPENAI_API_KEY is configured; a deterministic bilingual
 * mock otherwise so the feature is always usable (and testable).
 */
export type ContentProvider = 'openai' | 'mock';

export interface GeneratedContent {
  text: string;
  provider: ContentProvider;
}

const SYSTEM_PROMPT =
  'You write marketing content for a Saudi women-only beauty platform (Galaxy of Beauty). Reply ONLY with the requested shape.';

/**
 * Generate content. `shape` describes the expected reply (e.g.
 * "JSON with ar and en fields").
 */
export async function generateContent(
  userPrompt: string,
  shape: string,
): Promise<GeneratedContent> {
  const key = process.env['OPENAI_API_KEY'];
  if (key) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env['OPENAI_CONTENT_MODEL'] || 'gpt-4o-mini',
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `${shape}\n\n${userPrompt}` },
          ],
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI error ${res.status}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty completion');
      return { text, provider: 'openai' };
    } catch {
      // Fall through to the mock on any provider failure.
    }
  }
  return { text: mockContent(userPrompt, shape), provider: 'mock' };
}

/** Deterministic mock: echoes the inputs in a bilingual template. */
function mockContent(userPrompt: string, shape: string): string {
  const ar = extract(userPrompt, 'serviceNameAr') || extract(userPrompt, 'topic') || 'الخدمة';
  const en =
    extract(userPrompt, 'serviceNameEn') || extract(userPrompt, 'titleEn') || 'the service';
  if (shape.includes('faq')) {
    return `{"ar":"يستغرق ${ar} عادة من ساعة إلى ساعتين حسب التفاصيل المطلوبة.","en":"${en} usually takes one to two hours depending on the details requested."}`;
  }
  if (shape.includes('bodyAr')) {
    const titleAr = extract(userPrompt, 'titleAr') || ar;
    const titleEn = extract(userPrompt, 'titleEn') || en;
    return `{"titleAr":"${titleAr}","titleEn":"${titleEn}","bodyAr":"دليل شامل عن ${titleAr} مع نصائح عملية: ابدئي بخطوات بسيطة، والتزمي بروتين منتظم، واختاري منتجات مناسبة لنوع بشرتك. تابعي النتائج أسبوعياً ولا تترددي في استشارة مختصة عند الحاجة. هذا المحتوى يخص منصة جالكسي بيوتي.","bodyEn":"A complete guide to ${titleEn} with practical tips: start with simple steps, stick to a regular routine, and pick products that suit your skin type. Track results weekly and consult a specialist when needed. This content belongs to the Galaxy of Beauty platform."}`;
  }
  return `{"ar":"${ar} — خدمة متكاملة تجمع بين الجودة والعناية بلمسة سعودية أصيلة.","en":"${en} — a complete service combining quality and care with an authentic Saudi touch."}`;
}

function extract(text: string, key: string): string | null {
  const m = new RegExp(`${key}[=:]\\s*"([^"]+)"`).exec(text);
  return m ? (m[1] ?? null) : null;
}
