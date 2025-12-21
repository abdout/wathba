'use client'
import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './skeletons/ProductCardSkeleton'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '@/lib/features/product/productSlice'

const LatestProducts = ({ dict, lang }) => {
    const dispatch = useDispatch()
    const displayQuantity = 4
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)

    useEffect(() => {
        if (!products || products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title
                title={dict?.products?.title || 'Latest Products'}
                description={`${dict?.products?.showing || 'Showing'} ${Math.min(products.length, displayQuantity)} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`}
                href={`/${lang}/shop`}
                dict={dict}
                lang={lang}
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {loading && products.length === 0 ? (
                    [...Array(displayQuantity)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : (
                    products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, displayQuantity).map((product, index) => (
                        <ProductCard key={index} product={product} dict={dict} lang={lang} />
                    ))
                )}
            </div>
        </div>
    )
}

export default LatestProducts
