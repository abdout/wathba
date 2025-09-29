'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PromoBanner = ({ dict, lang }) => {
  const isRTL = lang === 'ar';

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className={`p-8 lg:p-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="space-y-4">
                <span className={`inline-block px-4 py-1 bg-orange-600/30 text-white rounded-full text-sm font-medium ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {dict?.promo?.badge || 'Only This Week'}
                </span>

                <h2 className={`text-3xl lg:text-5xl font-bold text-white leading-tight ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {dict?.promo?.title || 'Grocery store with different treasures'}
                </h2>

                <p className={`text-white/90 text-base lg:text-lg ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {dict?.promo?.description || 'We have prepared special discounts for you on grocery products...'}
                </p>

                <div className="flex items-center gap-6 pt-4">
                  <Link
                    href={`/${lang}/shop`}
                    className={`inline-flex items-center gap-2 bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors ${isRTL ? 'flex-row-reverse font-rubik' : 'font-outfit'}`}
                  >
                    {dict?.promo?.shopNow || 'Shop Now'}
                    {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                {/* Main Product Image */}
                <div className="relative w-full max-w-md">
                  <OptimizedImage
                    src="/assets/promo-products.png"
                    alt="Grocery Products"
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain"
                    transformation={[
                      { width: 500, height: 500, quality: 90 }
                    ]}
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold">40%</span>
                    <span className="text-xs">{dict?.promo?.off || 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;