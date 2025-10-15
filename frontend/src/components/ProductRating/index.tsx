// ProductRating.tsx
'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface Rating {
  id: number;
  rating: number;
  comment: string;
  user: string;
  created_at: string;
}

interface ProductRatingProps {
  productId: number;
  initialRatings?: Rating[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProductRating({ productId, initialRatings = [] }: ProductRatingProps) {
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth() || {};

  // ------------------ Fetch Ratings ------------------
  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}/ratings/`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
        return;
      }

      const data = await res.json();
      setRatings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [productId]);

  // ------------------ Submit New Rating ------------------
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }
    if (newRating === 0) {
      setError('Vui lòng chọn số sao');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const accessToken = getCookie('accessToken');
      if (!accessToken) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/products/${productId}/ratings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          rating: newRating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData?.non_field_errors?.[0]?.includes("unique")) {
          throw new Error("Bạn đã đánh giá sản phẩm này rồi.");
        }
        throw new Error(errorData.detail || 'Có lỗi xảy ra khi gửi đánh giá.');
      }

      // Reset form and reload list
      setNewRating(0);
      setComment('');
      fetchRatings();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ Calculate Average ------------------
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

  // ------------------ Render ------------------
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>

      {/* Hiển thị điểm trung bình */}
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">
          {ratings.length > 0
            ? `${averageRating.toFixed(1)} / 5 (${ratings.length} đánh giá)`
            : 'Chưa có đánh giá nào'}
        </span>
      </div>

      {/* Form đánh giá */}
      {user && (
        <form onSubmit={handleSubmitRating} className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="focus:outline-none"
                >
                  {star <= newRating ? (
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarOutline className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét của bạn
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* Danh sách đánh giá */}
      <div className="space-y-4">
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <div key={rating.id} className="border-b pb-4">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rating.rating ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium">{rating.user}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(rating.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-gray-600">{rating.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
        )}
      </div>

      {!user && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Vui lòng đăng nhập để đánh giá sản phẩm.
          </p>
        </div>
      )}
    </div>
  );
}
function getCookie(arg0: string) {
    throw new Error('Function not implemented.');
}

