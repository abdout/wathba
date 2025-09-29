'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = ({ dict, lang }) => {

    const displayQuantity = 8
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)
    const error = useSelector(state => state?.product?.error)
    const reduxState = useSelector(state => state)

    // Debug logging
    console.log('[BestSelling] Component rendered');
    console.log('[BestSelling] Full Redux state:', reduxState);
    console.log('[BestSelling] Product state:', reduxState?.product);
    console.log('[BestSelling] Products array:', products);
    console.log('[BestSelling] Products length:', products.length);
    console.log('[BestSelling] Loading state:', loading);
    console.log('[BestSelling] Error state:', error);

    if (products.length > 0) {
        console.log('[BestSelling] Sample product structure:', products[0]);
        console.log('[BestSelling] Product keys:', Object.keys(products[0]));
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title={dict?.products?.bestSelling || 'Best Selling'} description={`${dict?.products?.showing || 'Showing'} ${products.length < displayQuantity ? products.length : displayQuantity} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`} href='/shop' dict={dict} lang={lang} />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.slice().sort((a, b) => {
                    // Sort by totalRatings if available (from API), otherwise by rating array length
                    const aRatings = a.totalRatings !== undefined ? a.totalRatings : (a.rating?.length || 0);
                    const bRatings = b.totalRatings !== undefined ? b.totalRatings : (b.rating?.length || 0);
                    return bRatings - aRatings;
                }).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} dict={dict} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling