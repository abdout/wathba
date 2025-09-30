'use client'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CurrencyIcon from './CurrencyIcon'
import OptimizedImage from './OptimizedImage'

const ProductCard = ({ product, dict, lang }) => {

    // Use averageRating if available (from API), otherwise calculate from rating array
    const rating = product.averageRating !== undefined
        ? Math.round(product.averageRating)
        : product.rating?.length > 0
            ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
            : 0;

    // Get translated product name or fallback to original
    const productName = dict?.productNames?.[product.name] || product.name;

    return (
        <Link href={`/${lang || 'en'}/product/${product.id}`} className='group max-xl:mx-auto w-full max-w-[180px] sm:max-w-[240px]'>
            <div className='bg-[#F5F5F5] h-44 sm:h-52 w-full rounded-lg flex items-center justify-center p-6'>
                <div className='relative w-full h-full'>
                    <OptimizedImage
                        width={500}
                        height={500}
                        className='w-full h-full object-contain group-hover:scale-105 transition duration-300'
                        src={product.images[0]}
                        alt={productName}
                        transformation={[
                            { width: 300, height: 300, quality: 85 }
                        ]}
                    />
                </div>
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 w-full'>
                <div className='flex-1 min-w-0'>
                    <p className='truncate'>{productName}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#FFA500" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className='flex items-center gap-0.5 flex-shrink-0'>
                    <CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />
                    {product.price}
                </p>
            </div>
        </Link>
    )
}

export default ProductCard