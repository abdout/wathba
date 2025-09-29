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
    console.log('[LatestProducts] Component rendered');
    console.log('[LatestProducts] Full Redux state:', reduxState);
    console.log('[LatestProducts] Product state:', reduxState?.product);
    console.log('[LatestProducts] Products array:', products);
    console.log('[LatestProducts] Products length:', products.length);
    console.log('[LatestProducts] Loading state:', loading);
    console.log('[LatestProducts] Error state:', error);

    // Products are now fetched by ProductDataLoader component at the page level

    console.log('[LatestProducts] Rendering with products:', products.length, 'Loading:', loading, 'Error:', error)

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