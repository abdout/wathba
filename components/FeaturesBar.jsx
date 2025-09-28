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
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 flex items-center justify-center">
                  <OptimizedImage
                    src={feature.icon}
                    alt={feature.title}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className={`text-sm font-semibold text-gray-900 mb-1 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {feature.title}
                </h3>
                <p className={`text-xs text-gray-500 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
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