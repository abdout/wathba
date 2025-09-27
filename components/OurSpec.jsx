import React from 'react'
import Title from './Title'
import { ClockFadingIcon, HeadsetIcon, SendIcon } from 'lucide-react'

const OurSpecs = ({ dict }) => {

    const ourSpecsData = [
        {
            title: dict?.specs?.freeShipping?.title || "Free Shipping",
            description: dict?.specs?.freeShipping?.description || "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.",
            icon: SendIcon,
            accent: '#05DF72'
        },
        {
            title: dict?.specs?.easyReturn?.title || "7 Days easy Return",
            description: dict?.specs?.easyReturn?.description || "Change your mind? No worries. Return any item within 7 days.",
            icon: ClockFadingIcon,
            accent: '#FF8904'
        },
        {
            title: dict?.specs?.customerSupport?.title || "24/7 Customer Support",
            description: dict?.specs?.customerSupport?.description || "We're here for you. Get expert help with our customer support.",
            icon: HeadsetIcon,
            accent: '#A684FF'
        }
    ]

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title={dict?.specs?.title || 'Our Specifications'} description={dict?.specs?.description || "We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free."} />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-10 mt-26'>
                {
                    ourSpecsData.map((spec, index) => {
                        return (
                            <div className='relative h-44 px-8 flex flex-col items-center justify-center w-full text-center border rounded-lg group' style={{ backgroundColor: spec.accent + 10, borderColor: spec.accent + 30 }} key={index}>
                                <h3 className='text-slate-800 font-medium'>{spec.title}</h3>
                                <p className='text-sm text-slate-600 mt-3'>{spec.description}</p>
                                <div className='absolute -top-5 text-white size-10 flex items-center justify-center rounded-md group-hover:scale-105 transition' style={{ backgroundColor: spec.accent }}>
                                    <spec.icon size={20} />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default OurSpecs