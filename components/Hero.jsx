'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import CurrencyIcon from './CurrencyIcon'

const Hero = ({ dict, lang }) => {


    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-6'>
                <div className='relative flex-1 flex flex-col bg-green-200 rounded-3xl xl:min-h-100 group'>
                    <div className='p-7 sm:px-16 '>
                        <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                            <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>{dict?.hero?.news || "NEWS"}</span> {dict?.hero?.freeShipping || "Free Shipping on Orders Above AED 50!"}
                            {lang === 'ar' ? (
                                <ChevronLeftIcon className='group-hover:mr-2 transition-all' size={16} />
                            ) : (
                                <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                            )}
                        </div>
                        <h2 className={`text-3xl sm:text-5xl leading-[1.2] my-3 font-medium ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs sm:max-w-md`}>
                            {dict?.hero?.title || "Gadgets you'll love. Prices you'll trust."}
                        </h2>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                            <p>{dict?.hero?.startsFrom || "Starts from"}</p>
                            <p className='text-3xl flex items-center gap-1'><CurrencyIcon className="w-6 h-6" width={24} height={24} />4.90</p>
                        </div>
                        <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>{dict?.hero?.learnMore || "LEARN MORE"}</button>
                    </div>
                    <Image className={`sm:absolute bottom-0 w-full sm:max-w-sm ${lang === 'ar' ? 'left-0 md:left-10 scale-x-[-1]' : 'right-0 md:right-10'}`} src={assets.hero_model_img} alt="" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className={`text-3xl font-medium ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40`}>{dict?.hero?.bestProducts || "Best products"}</p>
                            <p className='flex items-center gap-1 mt-4'>{dict?.hero?.viewMore || "View more"}
                                {lang === 'ar' ? (
                                    <ArrowLeftIcon className='group-hover:mr-2 transition-all' size={18} />
                                ) : (
                                    <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
                                )}
                            </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img1} alt="" />
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className={`text-3xl font-medium ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40`}>{dict?.hero?.discounts || "20% discounts"}</p>
                            <p className='flex items-center gap-1 mt-4'>{dict?.hero?.viewMore || "View more"}
                                {lang === 'ar' ? (
                                    <ArrowLeftIcon className='group-hover:mr-2 transition-all' size={18} />
                                ) : (
                                    <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
                                )}
                            </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img2} alt="" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee dict={dict} />
        </div>

    )
}

export default Hero