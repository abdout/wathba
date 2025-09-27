'use client'
import React from 'react'
import toast from 'react-hot-toast';
import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function Banner({ dict, lang }) {

    const [isOpen, setIsOpen] = React.useState(true);

    const handleClaim = () => {
        setIsOpen(false);
        toast.success(dict?.cart?.couponSuccess || 'Coupon copied to clipboard!');
        navigator.clipboard.writeText('NEW20');
    };

    return isOpen && (
        <div className="w-full relative overflow-hidden">
            <div className="animated-gradient-banner h-14">
                <div className='flex items-center justify-center max-w-7xl mx-auto relative h-14 px-6 z-10'>
                    <div className="flex-1 flex justify-center items-center gap-4">
                        <p className="text-center font-medium text-sm text-white">{dict?.banner?.message || 'Get 20% OFF on Your First Order!'}</p>
                        <button onClick={handleClaim} type="button" className="font-normal text-sm text-gray-800 bg-white px-5 py-1.5 rounded-full max-sm:hidden whitespace-nowrap hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <Image
                                src={assets.gift}
                                alt="Gift"
                                width={16}
                                height={16}
                            />
                            {dict?.banner?.claimOffer || 'Claim Offer'}
                        </button>
                    </div>
                    <button onClick={() => setIsOpen(false)} type="button" className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} font-normal text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10`}>
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>

                {/* Animated gradient blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="gradient-blob gradient-blob-1"></div>
                    <div className="gradient-blob gradient-blob-2"></div>
                    <div className="gradient-blob gradient-blob-3"></div>
                </div>
            </div>
        </div>
    );
};