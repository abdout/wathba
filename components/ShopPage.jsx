'use client'
import { Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, MoveRightIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent({ dict, lang }) {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const products = useSelector(state => state.product.list)
    const isRTL = lang === 'ar';

    const filteredProducts = search
        ? products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            (dict?.productNames?.[product.name] && dict.productNames[product.name].toLowerCase().includes(search.toLowerCase()))
        )
        : products;

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <h1
                    onClick={() => router.push(`/${lang}/shop`)}
                    className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
                >
                    {search && (isRTL ? <MoveRightIcon size={20} /> : <MoveLeftIcon size={20} />)}
                    {dict?.general?.all || 'All'} <span className="text-slate-700 font-medium">{dict?.products?.products || 'Products'}</span>
                </h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} dict={dict} />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center text-slate-500 py-20">
                        <p className="text-xl">{dict?.shop?.noProductsFound || 'No products found'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ShopPage({ dict, lang }) {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">{dict?.general?.loading || 'Loading shop...'}</div>}>
            <ShopContent dict={dict} lang={lang} />
        </Suspense>
    );
}