import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

export default function Loading() {
    return (
        <div className="px-4 sm:px-12 lg:px-32 my-16">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
