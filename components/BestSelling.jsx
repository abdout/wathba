'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = ({ dict, lang }) => {

    const displayQuantity = 8
    const products = useSelector(state => state?.product?.list || [])

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title={dict?.products?.bestSelling || 'Best Selling'} description={`${dict?.products?.showing || 'Showing'} ${products.length < displayQuantity ? products.length : displayQuantity} ${dict?.products?.of || 'of'} ${products.length} ${dict?.products?.products || 'products'}`} href='/shop' dict={dict} lang={lang} />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} dict={dict} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling