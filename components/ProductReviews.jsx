'use client'
import { useEffect, useState } from 'react';
import { StarIcon, UserIcon } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId, dict }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userCanReview, setUserCanReview] = useState(false);
    const [userOrderId, setUserOrderId] = useState(null);

    const user = useSelector(state => state?.auth?.user);

    useEffect(() => {
        fetchReviews();
        if (user) {
            checkUserCanReview();
        }
    }, [productId, user]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?productId=${productId}`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
                setAverageRating(data.averageRating);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserCanReview = async () => {
        try {
            // Check if user has a delivered order with this product
            const response = await fetch('/api/orders');
            const data = await response.json();

            if (data.success) {
                const deliveredOrder = data.orders?.find(order =>
                    order.status === 'DELIVERED' &&
                    order.orderItems?.some(item => item.productId === productId)
                );

                if (deliveredOrder) {
                    // Check if user has already reviewed this product for this order
                    const hasReviewed = reviews.some(review =>
                        review.userId === user.id &&
                        review.orderId === deliveredOrder.id
                    );

                    if (!hasReviewed) {
                        setUserCanReview(true);
                        setUserOrderId(deliveredOrder.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking review eligibility:', error);
        }
    };

    const handleReviewSuccess = (newReview) => {
        setReviews([newReview, ...reviews]);
        setShowReviewForm(false);
        setUserCanReview(false);
        // Recalculate average
        const newAverage = (reviews.length * averageRating + newReview.rating) / (reviews.length + 1);
        setAverageRating(newAverage);
    };

    const RatingStars = ({ rating, size = 16 }) => (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    size={size}
                    className={`${
                        star <= rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );

    const RatingDistribution = () => {
        const distribution = [5, 4, 3, 2, 1].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length,
            percentage: reviews.length > 0
                ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
                : 0
        }));

        return (
            <div className="space-y-2">
                {distribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 w-3">{rating}</span>
                        <StarIcon size={14} className="text-yellow-500 fill-yellow-500" />
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-sm text-slate-600 w-8 text-right">{count}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 border-t">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                {dict?.review?.customerReviews || 'Customer Reviews'}
            </h2>

            {/* Rating Summary */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                    <div className="text-center md:text-left">
                        <div className="text-4xl font-bold text-slate-800">
                            {averageRating.toFixed(1)}
                        </div>
                        <RatingStars rating={Math.round(averageRating)} />
                        <p className="text-sm text-slate-600 mt-1">
                            {dict?.review?.basedOn || 'Based on'} {reviews.length} {dict?.review?.reviews || 'reviews'}
                        </p>
                    </div>
                    <div className="mt-4">
                        <RatingDistribution />
                    </div>
                </div>

                <div className="md:col-span-2">
                    {/* Add Review Button */}
                    {user && userCanReview && !showReviewForm && (
                        <div className="mb-6">
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-6 py-2.5 bg-slate-800 text-white rounded-md hover:bg-slate-900"
                            >
                                {dict?.review?.writeReview || 'Write a Review'}
                            </button>
                        </div>
                    )}

                    {/* Review Form */}
                    {showReviewForm && userCanReview && (
                        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {dict?.review?.writeYourReview || 'Write Your Review'}
                                </h3>
                                <button
                                    onClick={() => setShowReviewForm(false)}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <ReviewForm
                                productId={productId}
                                orderId={userOrderId}
                                onSuccess={handleReviewSuccess}
                                dict={dict}
                            />
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="pb-4 border-b last:border-0">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                            {review.user?.image ? (
                                                <img
                                                    src={review.user.image}
                                                    alt={review.user.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <UserIcon size={20} className="text-slate-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-slate-800">
                                                    {review.user?.name || dict?.review?.anonymous || 'Anonymous'}
                                                </h4>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <RatingStars rating={review.rating} />
                                            <p className="mt-2 text-slate-600">
                                                {review.review}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>{dict?.review?.noReviews || 'No reviews yet'}</p>
                                {user && userCanReview && (
                                    <p className="mt-2">
                                        {dict?.review?.beFirst || 'Be the first to review this product!'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;