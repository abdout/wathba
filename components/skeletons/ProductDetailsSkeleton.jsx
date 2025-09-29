const ProductDetailsSkeleton = () => {
    return (
        <div className="flex max-lg:flex-col gap-12 animate-pulse">
            {/* Image Gallery Skeleton */}
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {[1, 2, 3, 4].map((_, index) => (
                        <div key={index} className="bg-gray-200 size-26 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-100 sm:size-113 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Product Info Skeleton */}
            <div className="flex-1">
                {/* Title */}
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>

                {/* Rating */}
                <div className="flex items-center mt-2 gap-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Price */}
                <div className="flex items-start my-6 gap-3">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>

                {/* Save tag */}
                <div className="h-4 bg-gray-200 rounded w-32 mb-10"></div>

                {/* Add to Cart Button */}
                <div className="h-12 bg-gray-200 rounded w-40"></div>

                {/* Divider */}
                <hr className="border-gray-200 my-5" />

                {/* Features */}
                <div className="flex flex-col gap-4">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-44"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;