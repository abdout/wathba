'use client'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '', dict, lang }) => {
    const isRTL = lang === 'ar';

    return (
        <div className='flex flex-col items-center'>
            <h2 className='text-2xl font-semibold text-slate-800'>{title}</h2>
            <Link href={href} className='flex items-center gap-5 text-sm text-slate-600 mt-2'>
                <p className='max-w-lg text-center'>{description}</p>
                {visibleButton && (
                    <button className='text-green-500 flex items-center gap-1'>
                        <span className="hidden sm:inline">{dict?.general?.viewMore || 'View more'}</span>
                        <span className="sm:hidden">More</span>
                        {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                    </button>
                )}
            </Link>
        </div>
    )
}

export default Title