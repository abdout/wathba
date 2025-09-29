const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            {/* Image Skeleton */}
            <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>

            {/* Title Skeleton */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

            {/* Category Skeleton */}
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>

            {/* Rating Skeleton */}
            <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>

            {/* Price Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16 opacity-50"></div>
            </div>

            {/* Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
    );
};

export default ProductCardSkeleton;