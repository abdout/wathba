'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = ({ dict, lang }) => {

    const displayQuantity = 4
    const products = useSelector(state => state?.product?.list || [])
    const loading = useSelector(state => state?.product?.loading)
    const error = useSelector(state => state?.product?.error)

    console.log('LatestProducts - Products:', products.length, 'Loading:', loading, 'Error:', error)

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