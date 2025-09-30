'use client'
import { ArrowRightIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import React from 'react'
import CurrencyIcon from './CurrencyIcon'
import OptimizedImage from './OptimizedImage'

const Hero04 = ({ dict, lang }) => {
    return (
        <div className='mx-6'>
            <div className='relative overflow-hidden'>
                <div className='flex max-lg:flex-col gap-8 max-w-7xl mx-auto my-6'>
                    {/* Main Hero Section */}
                    <div className='relative flex-1 flex flex-col bg-green-200 rounded-3xl lg:min-h-96 group transition-all duration-500'>
                        <div className='p-5 sm:px-12'>
                            <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                                <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>
                                    {dict?.hero?.news || "NEWS"}
                                </span>
                                {dict?.hero?.freeShipping || "Free Shipping on Orders Above AED 50!"}
                                {lang === 'ar' ? (
                                    <ChevronLeftIcon className='group-hover:mr-2 transition-all' size={16} />
                                ) : (
                                    <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                                )}
                            </div>
                            <h2 className={`text-3xl sm:text-5xl leading-[1.2] my-3 font-semibold ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs sm:max-w-md whitespace-pre-line`}>
                                {dict?.hero?.applianceTitle || "Smart Home\nAppliances"}
                            </h2>
                            <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                                <p>{dict?.hero?.startsFrom || "Starts from"}</p>
                                <div className='text-2xl flex items-center gap-1'>
                                    <CurrencyIcon className="w-5 h-5" width={20} height={20} />
                                    4.90
                                </div>
                            </div>
                            <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>
                                {dict?.hero?.learnMore || "LEARN MORE"}
                            </button>
                        </div>
                        <div className={`sm:absolute bottom-0 w-full sm:w-80 max-w-sm ${lang === 'ar' ? 'left-0 md:left-5' : 'right-0 md:right-5'}`}>
                            <OptimizedImage
                                className={`w-full h-auto object-contain ${lang === 'ar' ? 'scale-x-[-1]' : ''}`}
                                src='/assets/hero-10.png'
                                alt={dict?.hero?.applianceAlt || "Home appliances"}
                                width={320}
                                height={320}
                                priority
                                quality={90}
                                style={{ objectFit: 'contain', maxHeight: '320px' }}
                            />
                        </div>
                    </div>

                    {/* Side Panel for Home Appliances */}
                    <div className='flex flex-col md:flex-row lg:flex-col gap-5 w-full lg:max-w-xs text-sm text-slate-600'>
                        {/* Kitchen Essentials Card */}
                        <div className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group'>
                            <div>
                                <p className={`text-2xl font-medium ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40`}>
                                    {dict?.hero?.kitchenEssentials || "Kitchen Essentials"}
                                </p>
                                <p className='flex items-center gap-1 mt-4'>
                                    <span className="hidden sm:inline">{dict?.hero?.viewMore || "View more"}</span>
                                    <span className="sm:hidden">More</span>
                                    {lang === 'ar' ? (
                                        <ArrowLeftIcon className='group-hover:mr-2 transition-all' size={18} />
                                    ) : (
                                        <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
                                    )}
                                </p>
                            </div>
                            <OptimizedImage
                                className='w-32'
                                src='https://ik.imagekit.io/osmanabdout/assets/hero-11.png?updatedAt=1759121181201'
                                alt="Kitchen appliances"
                                width={120}
                                height={120}
                                quality={85}
                            />
                        </div>

                        {/* Smart Home Card */}
                        <div className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group'>
                            <div>
                                <p className={`text-2xl font-medium ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40`}>
                                    {dict?.hero?.cleaningTools || "Cleaning Tools"}
                                </p>
                                <p className='flex items-center gap-1 mt-4'>
                                    <span className="hidden sm:inline">{dict?.hero?.viewMore || "View more"}</span>
                                    <span className="sm:hidden">More</span>
                                    {lang === 'ar' ? (
                                        <ArrowLeftIcon className='group-hover:mr-2 transition-all' size={18} />
                                    ) : (
                                        <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
                                    )}
                                </p>
                            </div>
                            <OptimizedImage
                                className='w-32'
                                src='https://ik.imagekit.io/osmanabdout/assets/hero-12.png?updatedAt=1759121181304'
                                alt="Smart living devices"
                                width={120}
                                height={120}
                                quality={85}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero04