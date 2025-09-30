'use client'

import { useSelector } from "react-redux";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function RelatedProducts({ currentProduct, dict, lang }) {
    const products = useSelector(state => state?.product?.list || []);
    const scrollRef = useRef(null);
    const isRTL = lang === 'ar';

    // Filter related products by same category, excluding current product
    const relatedProducts = products.filter(p =>
        p.category === currentProduct?.category &&
        p.id !== currentProduct?.id
    ).slice(0, 8);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">
                    {dict?.product?.relatedProducts || "Related Products"}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll(isRTL ? 'right' : 'left')}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                        {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <button
                        onClick={() => scroll(isRTL ? 'left' : 'right')}
                        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                        {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedProducts.map(product => (
                    <div key={product.id} className="min-w-[250px]">
                        <ProductCard
                            product={product}
                            dict={dict}
                            lang={lang}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}