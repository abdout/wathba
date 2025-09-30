'use client'
import { ArrowRight, ArrowLeft, StarIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import OptimizedImage from "./OptimizedImage"

const ProductDescription = ({ product, dict, lang }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const isRTL = lang === 'ar'

    // Early return if product is not available
    if (!product) {
        return null;
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => {
                    const tabLabel = tab === 'Description' ? (dict?.product?.description || 'Description') : (dict?.product?.reviews || 'Reviews');
                    return (
                        <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                            {tabLabel}
                        </button>
                    );
                })}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {product?.rating && product.rating.length > 0 ? (
                        product.rating.map((item,index) => (
                            <div key={index} className="flex gap-5 mb-10">
                                <OptimizedImage src={item.user.image} alt="" className="size-10 rounded-full" width={100} height={100} />
                                <div>
                                    <div className="flex items-center" >
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#FFA500" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                    <p className="text-sm max-w-lg my-4">{item.review}</p>
                                    <p className="font-medium text-slate-800">{item.user.name}</p>
                                    <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400">{dict?.product?.noReviews || "No reviews yet"}</p>
                    )}
                </div>
            )}

            {/* Store Page */}
            {product?.store && (
                <div className="flex gap-3 mt-14">
                    <OptimizedImage
                        src="/assets/logo.svg"
                        alt={product.store.name}
                        className="size-11 rounded-full ring ring-slate-400 object-contain p-1 bg-white"
                        width={100}
                        height={100}
                    />
                    <div>
                        <p className="font-medium text-slate-600">{dict?.product?.productBy || "Product by"} {product.store.name}</p>
                        <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500">
                            {dict?.product?.viewStore || "view store"}
                            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription