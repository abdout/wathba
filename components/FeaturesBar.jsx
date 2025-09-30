'use client';

import React from 'react';
import OptimizedImage from './OptimizedImage';

const FeaturesBar = ({ dict, lang }) => {
  const isRTL = lang === 'ar';

  const features = [
    {
      id: 1,
      icon: '/assets/delivery.png',
      title: dict?.features?.freeShipping?.title || 'Free Shipping',
      description: dict?.features?.freeShipping?.description || 'Free shipping on all your order'
    },
    {
      id: 2,
      icon: '/assets/headphones.png',
      title: dict?.features?.customerSupport?.title || 'Customer Support 24/7',
      description: dict?.features?.customerSupport?.description || 'Instant access to Support'
    },
    {
      id: 3,
      icon: '/assets/shopping-bag.png',
      title: dict?.features?.securePayment?.title || '100% Secure Payment',
      description: dict?.features?.securePayment?.description || 'We ensure your money is save'
    },
    {
      id: 4,
      icon: '/assets/package.png',
      title: dict?.features?.moneyBack?.title || 'Money-Back Guarantee',
      description: dict?.features?.moneyBack?.description || '30 Days Money-Back Guarantee'
    }
  ];

  return (
    <section className="py-8 mx-6 bg-gray-100 rounded-md">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  <OptimizedImage
                    src={feature.icon}
                    alt={feature.title}
                    width={24}
                    height={24}
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  />
                </div>
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className={`text-[10px] sm:text-xs font-semibold text-gray-900 mb-0.5 sm:mb-1 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {feature.title}
                </h3>
                <p className={`text-[9px] sm:text-xs text-gray-500 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;