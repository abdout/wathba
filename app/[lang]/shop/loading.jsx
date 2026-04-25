import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

// Mirror the shop grid layout so the skeleton matches the final paint footprint.
export default function Loading() {
    return (
        <div className="px-4 sm:px-12 lg:px-32 my-16">
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
