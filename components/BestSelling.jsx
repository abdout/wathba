'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './skeletons/ProductCardSkeleton'
import { useSelector } from 'react-redux'

const BestSelling = ({ dict, lang }) => {
    const displayQuantity = 8
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title
                title={dict?.products?.bestSelling || 'Best Selling'}
                description={`${dict?.products?.showing || 'Showing'} ${Math.min(products.length, displayQuantity)} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`}
                href={`/${lang}/shop`}
                dict={dict}
                lang={lang}
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {loading && products.length === 0 ? (
                    [...Array(displayQuantity)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : (
                    products.slice().sort((a, b) => {
                        const aRatings = a.totalRatings !== undefined ? a.totalRatings : (a.rating?.length || 0);
                        const bRatings = b.totalRatings !== undefined ? b.totalRatings : (b.rating?.length || 0);
                        return bRatings - aRatings;
                    }).slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} dict={dict} lang={lang} />
                    ))
                )}
            </div>
        </div>
    )
}

export default BestSelling
