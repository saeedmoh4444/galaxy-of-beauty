import { Card } from '@galaxy/shared';

export default function TermsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">📋 الشروط والأحكام</h1>
      <Card padding="lg">
        <div className="space-y-4 text-sm leading-relaxed text-text-primary">
          <section>
            <h2 className="font-bold text-lg mb-2">١. مقدمة</h2>
            <p>مرحباً بكِ في جالكسي بيوتي. باستخدامكِ للمنصة، فإنكِ توافقين على الشروط والأحكام التالية. يرجى قراءتها بعناية.</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">٢. الخدمات</h2>
            <p>تعمل جالكسي بيوتي كمنصة وسيطة بين العملاء ومقدمي خدمات التجميل. نحن لا نقدم خدمات التجميل مباشرة، وإنما نسهل عملية الحجز والتواصل.</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">٣. الحجوزات والإلغاء</h2>
            <p>يمكن إلغاء الحجز قبل موعده بـ ٢٤ ساعة على الأقل. في حالة الإلغاء المتأخر، قد يتم تطبيق رسوم إلغاء. يحق للمنصة تعديل أو إلغاء أي حجز حسب الحاجة.</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">٤. المدفوعات</h2>
            <p>تتم معالجة المدفوعات عبر بوابات دفع آمنة. الأسعار المعروضة شاملة للضريبة ما لم يُذكر خلاف ذلك. قد يتم تطبيق رسوم خدمة إضافية.</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">٥. الخصوصية</h2>
            <p>نحن نلتزم بحماية بياناتكِ الشخصية وفقاً لسياسة الخصوصية الخاصة بنا. لا نشارك معلوماتكِ مع أطراف ثالثة دون موافقتكِ.</p>
          </section>
          <section>
            <h2 className="font-bold text-lg mb-2">٦. التعديلات</h2>
            <p>تحتفظ جالكسي بيوتي بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعاركِ بأي تغييرات جوهرية عبر البريد الإلكتروني أو عبر المنصة.</p>
          </section>
        </div>
      </Card>
    </div>
  );
}
