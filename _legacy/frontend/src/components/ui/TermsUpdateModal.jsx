import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

/**
 * Terms Update Modal
 *
 * When the platform updates its Terms & Conditions, existing users
 * must accept the new version before continuing. This modal appears
 * on login if the user hasn't accepted the latest version.
 */
export default function TermsUpdateModal() {
  const [show, setShow] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const { data: termsData } = useQuery({
    queryKey: ['terms-latest'],
    queryFn: async () => { const { data } = await api.get('/terms/latest'); return data; },
    enabled: isAuthenticated,
  });

  const acceptTerms = useMutation({
    mutationFn: async () => {
      await api.post('/terms/accept', { termsVersion: termsData?.version });
    },
    onSuccess: () => setShow(false),
  });

  useEffect(() => {
    if (isAuthenticated && termsData?.version) {
      const acceptedVersion = localStorage.getItem('acceptedTermsVersion');
      if (acceptedVersion !== termsData.version) {
        setShow(true);
      }
    }
  }, [isAuthenticated, termsData]);

  const handleAccept = async () => {
    await acceptTerms.mutateAsync();
    if (termsData?.version) {
      localStorage.setItem('acceptedTermsVersion', termsData.version);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-3">📋</span>
          <h2 className="text-xl font-bold text-gray-900 font-display">
            تحديث الشروط والأحكام
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            تم تحديث شروط وأحكام المنصة. يرجى الاطلاع عليها والمتابعة.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
          <p>باستخدامك لمنصة جالكسي بيوتي، فإنك توافقين على:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500">
            <li>الالتزام بسياسة الاستخدام والخصوصية</li>
            <li>صحة المعلومات المقدمة عند التسجيل</li>
            <li>الدفع وفقاً للأسعار المعلنة لكل خدمة</li>
            <li>سياسة الإلغاء والاسترداد المعمول بها</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            قراءة الشروط كاملة
          </a>
          <button
            onClick={handleAccept}
            disabled={acceptTerms.isPending}
            className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {acceptTerms.isPending ? 'جاري...' : 'أوافق وأتابع'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          الإصدار {termsData?.version || '1.0'}
        </p>
      </div>
    </div>
  );
}
