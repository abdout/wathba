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
        <div className="mt-12 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Store size={24} className="text-slate-700" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800">
                            {dict?.product?.moreFrom || "More from"} {currentProduct.store.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                            {dict?.product?.qualityProducts || "Quality products from trusted vendor"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/${lang}/shop?store=${currentProduct.storeId}`)}
                    className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                    {dict?.product?.viewAllProducts || "View All Products"}
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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