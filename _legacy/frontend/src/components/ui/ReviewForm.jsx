import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

/**
 * Star rating + comment form for reviewing a completed booking.
 * @param {{ bookingId: number, onClose: () => void }} props
 */
export default function ReviewForm({ bookingId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const submitReview = useMutation({
    mutationFn: async () => {
      await api.post('/reviews', { bookingId, rating, comment: comment || null });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('شكراً لتقييمك! ⭐');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل إرسال التقييم'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">قيمي تجربتك</h3>

        <div className="flex justify-center gap-1 mb-4" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {star <= (hoverRating || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-3">
          {rating === 1 ? 'سيئة جداً' : rating === 2 ? 'سيئة' : rating === 3 ? 'جيدة' : rating === 4 ? 'جيدة جداً' : rating === 5 ? 'ممتازة!' : 'اختر تقييماً'}
        </p>

        <textarea
          className="input-field text-sm mb-4"
          rows={3}
          placeholder="أضف تعليقاً (اختياري)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={() => submitReview.mutate()}
          disabled={rating === 0 || submitReview.isPending}
          className="btn-primary w-full"
        >
          {submitReview.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
        <button onClick={onClose} className="btn-ghost text-sm mt-2 w-full">إلغاء</button>
      </div>
    </div>
  );
}
