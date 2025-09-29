'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './skeletons/ProductCardSkeleton'
import { useSelector } from 'react-redux'

const BestSelling = ({ dict, lang }) => {

    const displayQuantity = 8
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)
    const error = useSelector(state => state?.product?.error)
    const reduxState = useSelector(state => state)

    // Enhanced debug logging
    console.log('=== BestSelling DEBUG START ===');
    console.log('[BestSelling] Component rendered at:', new Date().toISOString());
    console.log('[BestSelling] Redux state check:', {
        hasReduxState: !!reduxState,
        stateKeys: reduxState ? Object.keys(reduxState) : [],
        hasProductSlice: !!reduxState?.product,
        productSliceKeys: reduxState?.product ? Object.keys(reduxState.product) : []
    });
    console.log('[BestSelling] Product list analysis:', {
        productsFromSelector: products,
        isArray: Array.isArray(products),
        length: products.length,
        isEmpty: products.length === 0,
        firstThreeItems: products.slice(0, 3)
    });
    console.log('[BestSelling] State flags:', {
        loading,
        error,
        displayQuantity
    });

    if (products.length > 0) {
        console.log('[BestSelling] First product details:', {
            product: products[0],
            keys: Object.keys(products[0]),
            hasRating: !!products[0].rating,
            ratingType: typeof products[0].rating,
            totalRatings: products[0].totalRatings
        });
    } else {
        console.log('[BestSelling] WARNING: No products in Redux store!');
        console.log('[BestSelling] Checking if ProductDataLoader exists on page...');
    }
    console.log('=== BestSelling DEBUG END ===');

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title={dict?.products?.bestSelling || 'Best Selling'} description={loading ? dict?.common?.loading || 'Loading...' : `${dict?.products?.showing || 'Showing'} ${products.length < displayQuantity ? products.length : displayQuantity} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`} href='/shop' dict={dict} lang={lang} />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {loading && products.length === 0 ? (
                    [...Array(displayQuantity)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : (
                    products.slice().sort((a, b) => {
                        // Sort by totalRatings if available (from API), otherwise by rating array length
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