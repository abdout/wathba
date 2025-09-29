const ProductDescriptionSkeleton = () => {
    return (
        <div className="my-18 animate-pulse">
            {/* Tabs Skeleton */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                <div className="h-8 bg-gray-200 rounded w-24 mr-4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Description Content Skeleton */}
            <div className="max-w-xl space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            {/* Store Info Skeleton */}
            <div className="flex gap-3 mt-14">
                <div className="size-11 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductDescriptionSkeleton;