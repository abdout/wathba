'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const FeaturedCategories = ({ dict, lang }) => {
  const isRTL = lang === 'ar';

  const categories = [
    {
      id: 1,
      name: dict?.categories?.freshFruit || 'Fresh Fruit',
      image: '/grocery/fruit.png',
      href: '/shop?category=fruit'
    },
    {
      id: 2,
      name: dict?.categories?.freshVegetables || 'Fresh Vegetables',
      image: '/grocery/vegetable.png',
      href: '/shop?category=vegetables'
    },
    {
      id: 3,
      name: dict?.categories?.meatFish || 'Meat & Fish',
      image: '/grocery/meat.png',
      href: '/shop?category=meat-fish'
    },
    {
      id: 4,
      name: dict?.categories?.snacks || 'Snacks',
      image: '/grocery/snacks.png',
      href: '/shop?category=snacks'
    },
    {
      id: 5,
      name: dict?.categories?.beverages || 'Beverages',
      image: '/grocery/beverages.png',
      href: '/shop?category=beverages'
    },
    {
      id: 6,
      name: dict?.categories?.beautyHealth || 'Beauty & Health',
      image: '/grocery/beauty.png',
      href: '/shop?category=beauty-health'
    },
    {
      id: 7,
      name: dict?.categories?.breadBakery || 'Bread & Bakery',
      image: '/grocery/bread.png',
      href: '/shop?category=bread-bakery'
    },
    {
      id: 8,
      name: dict?.categories?.bakingNeeds || 'Baking Needs',
      image: '/grocery/baking.png',
      href: '/shop?category=baking-needs'
    },
    {
      id: 9,
      name: dict?.categories?.cooking || 'Cooking',
      image: '/grocery/cooking.png',
      href: '/shop?category=cooking'
    },
    {
      id: 10,
      name: dict?.categories?.diabeticFood || 'Diabetic Food',
      image: '/grocery/diabetic.png',
      href: '/shop?category=diabetic-food'
    },
    {
      id: 11,
      name: dict?.categories?.dishDetergents || 'Dish Detergents',
      image: '/grocery/detergent.png',
      href: '/shop?category=dish-detergents'
    },
    {
      id: 12,
      name: dict?.categories?.oil || 'Oil',
      image: '/grocery/oil.png',
      href: '/shop?category=oil'
    }
  ];

  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            {dict?.homepage?.grocery || 'Grocery'}
          </h2>
          <Link href={`/${lang}/shop`} className="flex items-center gap-5 text-sm text-slate-600 mt-2">
            <p className="max-w-lg text-center">
              <span className="hidden sm:inline">{dict?.homepage?.grocerySubtitle || 'Your daily needs delivered to your doorstep'}</span>
              <span className="sm:hidden">Daily needs at doorstep</span>
            </p>
            <button className="text-green-500 flex items-center gap-1">
              <span className="hidden sm:inline">{dict?.general?.viewMore || 'View more'}</span>
              <span className="sm:hidden">More</span>
              {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${lang}${category.href}`}
              className="group"
            >
              <div className="rounded-md p-3 border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all duration-300">
                <div className="h-24 sm:h-28 flex items-center justify-center mb-2">
                  <OptimizedImage
                    src={category.image}
                    alt={category.name}
                    width={100}
                    height={70}
                    className="w-24 h-16 object-cover"
                    transformation={[
                      { width: 100, height: 70, quality: 90 }
                    ]}
                  />
                </div>
                <h3 className={`text-center text-xs sm:text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors truncate ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;