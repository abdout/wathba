'use client'

import { useSelector } from "react-redux";
import ProductCard from "./ProductCard";
import { Store, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShopByStore({ currentProduct, dict, lang }) {
    const products = useSelector(state => state?.product?.list || []);
    const router = useRouter();
    const isRTL = lang === 'ar';

    // Filter products from the same store, excluding current product
    const storeProducts = products.filter(p =>
        p.storeId === currentProduct?.storeId &&
        p.id !== currentProduct?.id
    ).slice(0, 4);

    if (!currentProduct?.store || storeProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Store info section */}
                <div className="flex items-start sm:items-center gap-3">
                    {/* Icon container */}
                    <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
                        <Store size={20} className="text-slate-700 sm:hidden" />
                        <Store size={24} className="text-slate-700 hidden sm:block" />
                    </div>
                    {/* Store text info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-semibold text-slate-800 break-words">
                            {dict?.product?.moreFrom || "More from"}
                            <span className="block sm:inline sm:ml-1">{currentProduct.store.name}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 hidden sm:block">
                            {dict?.product?.qualityProducts || "Quality products from trusted vendor"}
                        </p>
                    </div>
                </div>

                {/* View all button - full width on mobile, auto width on desktop */}
                <button
                    onClick={() => router.push(`/${lang}/shop?store=${currentProduct.storeId}`)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                    {dict?.product?.viewAllProducts || "View All Products"}
                    <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                </button>
            </div>

            {/* Product grid - 2 columns on mobile for better visibility */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {storeProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        dict={dict}
                        lang={lang}
                    />
                ))}
            </div>
        </div>
    );
}