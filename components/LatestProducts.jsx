'use client'
import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '@/lib/features/product/productSlice'

const LatestProducts = ({ dict, lang }) => {
    const dispatch = useDispatch()
    const displayQuantity = 4
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)
    const error = useSelector(state => state?.product?.error)
    const reduxState = useSelector(state => state)

    // Detailed debug logging
    console.log('=== LatestProducts DEBUG START ===');
    console.log('[LatestProducts] Component mounted/rendered at:', new Date().toISOString());
    console.log('[LatestProducts] Full Redux state structure:', {
        hasProduct: !!reduxState?.product,
        productKeys: reduxState?.product ? Object.keys(reduxState.product) : [],
        fullState: reduxState
    });
    console.log('[LatestProducts] Product state details:', {
        state: reduxState?.product,
        list: reduxState?.product?.list,
        listType: Array.isArray(reduxState?.product?.list) ? 'array' : typeof reduxState?.product?.list,
        listLength: reduxState?.product?.list?.length
    });
    console.log('[LatestProducts] Products variable:', {
        value: products,
        isArray: Array.isArray(products),
        length: products.length,
        firstItem: products[0]
    });
    console.log('[LatestProducts] Loading state:', loading);
    console.log('[LatestProducts] Error state:', error);
    console.log('[LatestProducts] Display quantity:', displayQuantity);

    // Check if products need to be fetched
    useEffect(() => {
        console.log('[LatestProducts useEffect] Checking if products need fetching');
        console.log('[LatestProducts useEffect] Current products:', products);
        console.log('[LatestProducts useEffect] Loading state:', loading);

        if (!products || products.length === 0) {
            console.log('[LatestProducts useEffect] No products found, dispatching fetchProducts');
            dispatch(fetchProducts());
        }
    }, [dispatch]);

    console.log('[LatestProducts] About to render, products count:', products.length);
    console.log('=== LatestProducts DEBUG END ===');

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title={dict?.products?.title || 'Latest Products'} description={`${dict?.products?.showing || 'Showing'} ${products.length < displayQuantity ? products.length : displayQuantity} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`} href='/shop' dict={dict} lang={lang} />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} dict={dict} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts