'use client'
import { useState } from 'react';
import { StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, orderId, onSuccess, dict, existingReview = null }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState(existingReview?.review || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error(dict?.review?.selectRating || 'Please select a rating');
            return;
        }

        if (review.trim().length < 10) {
            toast.error(dict?.review?.minLength || 'Review must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const endpoint = existingReview ? '/api/reviews' : '/api/reviews';
            const method = existingReview ? 'PUT' : 'POST';
            const body = existingReview
                ? { reviewId: existingReview.id, rating, review }
                : { productId, orderId, rating, review };

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(
                    existingReview
                        ? dict?.review?.updateSuccess || 'Review updated successfully'
                        : dict?.review?.submitSuccess || 'Review submitted successfully'
                );
                if (onSuccess) {
                    onSuccess(data.review);
                }
                // Reset form if new review
                if (!existingReview) {
                    setRating(0);
                    setReview('');
                }
            } else {
                toast.error(data.error || dict?.review?.submitError || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(dict?.review?.submitError || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = () => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    disabled={isSubmitting}
                >
                    <StarIcon
                        size={24}
                        className={`transition-colors ${
                            star <= (hoveredRating || rating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm text-slate-600">
                {rating > 0 && `(${rating} ${dict?.review?.stars || 'stars'})`}
            </span>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {dict?.review?.yourRating || 'Your Rating'}
                </label>
                <StarRating />
            </div>

            <div>
                <label htmlFor="review" className="block text-sm font-medium text-slate-700 mb-2">
                    {dict?.review?.yourReview || 'Your Review'}
                </label>
                <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                    placeholder={dict?.review?.placeholder || 'Share your experience with this product...'}
                />
                <div className="mt-1 text-sm text-slate-500 text-right">
                    {review.length}/1000 {dict?.review?.characters || 'characters'}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || rating === 0 || review.trim().length < 10}
                className={`w-full py-2.5 px-4 rounded-md font-medium transition-all ${
                    isSubmitting || rating === 0 || review.trim().length < 10
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.98]'
                }`}
            >
                {isSubmitting
                    ? dict?.review?.submitting || 'Submitting...'
                    : existingReview
                    ? dict?.review?.updateReview || 'Update Review'
                    : dict?.review?.submitReview || 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;