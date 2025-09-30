const ProductCardSkeleton = () => {
    return (
        <div className="max-xl:mx-auto w-full max-w-[180px] sm:max-w-[240px] animate-pulse">
            {/* Image Skeleton */}
            <div className="bg-[#F5F5F5] h-44 sm:h-52 w-full rounded-lg"></div>

            {/* Product Info Skeleton */}
            <div className="flex justify-between gap-3 pt-2 w-full">
                <div className="flex-1 min-w-0">
                    {/* Title Skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    {/* Rating Skeleton */}
                    <div className="flex gap-0.5">
                        {Array(5).fill('').map((_, index) => (
                            <div key={index} className="w-3.5 h-3.5 bg-gray-200 rounded-full"></div>
                        ))}
                    </div>
                </div>
                {/* Price Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-12 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;