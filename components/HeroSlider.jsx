'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { imagekitAssets } from '@/lib/imagekit-urls';

const HeroSlider = ({ dict, lang }) => {
    const isRTL = lang === 'ar';
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        // First Slide - Tech/Gadgets Theme
        {
            id: 1,
            badge: dict?.hero?.freeShipping || 'Free Shipping on Orders Above AED 50!',
            title: dict?.hero?.title || "Gadgets you'll love. Prices you'll trust.",
            subtitle: dict?.hero?.subtitle || 'Your ultimate multi-vendor e-commerce destination',
            buttonText: dict?.hero?.viewMore || 'View More',
            productImage: imagekitAssets.hero_product_img1,
            sideImage1: imagekitAssets.hero_product_img2,
            sideImage2: imagekitAssets.gift,
            sideText1: dict?.hero?.bestProducts || 'Best products',
            sideText2: dict?.hero?.discounts || '20% discounts',
            bgGradient: 'from-green-50 to-white'
        },
        // Second Slide - Organic Food Theme
        {
            id: 2,
            badge: dict?.hero?.saleText || 'Sale up to 30% OFF',
            title: dict?.hero?.organicTitle || 'Fresh & Healthy Organic Food',
            subtitle: dict?.hero?.shippingText || 'Free shipping on all your order',
            buttonText: dict?.hero?.shopNow || 'Shop now',
            productImage: imagekitAssets.product_img5,
            sideImage1: imagekitAssets.product_img6,
            sideImage2: imagekitAssets.product_img7,
            sideText1: dict?.hero?.summerSale || '75% Sales',
            sideText2: dict?.hero?.bestDeal || 'Best Deal',
            bgGradient: 'from-green-100 to-white'
        },
        // Third Slide - Bookshop & Stationery Theme
        {
            id: 3,
            badge: dict?.hero?.bookshopPromo || 'Back to School Special Offers!',
            title: dict?.hero?.bookshopTitle || 'Books & Stationery for Every Need',
            subtitle: dict?.hero?.bookshopSubtitle || 'Complete your study essentials',
            buttonText: dict?.hero?.shopNow || 'Shop Now',
            productImage: imagekitAssets.product_img8,
            sideImage1: imagekitAssets.product_img9,
            sideImage2: imagekitAssets.product_img10,
            sideText1: dict?.hero?.studyEssentials || 'Study Essentials',
            sideText2: dict?.hero?.artSupplies || 'Art Supplies',
            bgGradient: 'from-purple-100 to-white'
        },
        // Fourth Slide - Home Appliances Theme
        {
            id: 4,
            badge: dict?.hero?.appliancePromo || 'Energy Efficient Home Solutions!',
            title: dict?.hero?.applianceTitle || 'Smart Home Appliances',
            subtitle: dict?.hero?.applianceSubtitle || 'Upgrade your living space',
            buttonText: dict?.hero?.explore || 'Explore',
            productImage: imagekitAssets.product_img11,
            sideImage1: imagekitAssets.product_img12,
            sideImage2: imagekitAssets.product_img13,
            sideText1: dict?.hero?.kitchenDeals || 'Kitchen Deals',
            sideText2: dict?.hero?.smartLiving || 'Smart Living',
            bgGradient: 'from-red-100 to-white'
        }
    ];

    // Auto-slide functionality
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Slides Container */}
            <div className="relative">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${index === currentSlide ? 'block' : 'hidden'} transition-all duration-500`}
                    >
                        <section className={`bg-gradient-to-b ${slide.bgGradient} py-8 sm:py-12`}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

                                    {/* Left Content */}
                                    <div className={`lg:col-span-1 space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        <div className="space-y-4">
                                            <span className={`inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                                                {slide.badge}
                                            </span>

                                            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                                                {slide.title}
                                            </h1>

                                            <p className={`text-base sm:text-lg text-gray-600 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                                                {slide.subtitle}
                                            </p>

                                            <Link
                                                href={`/${lang}/shop`}
                                                className={`inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors ${isRTL ? 'flex-row-reverse font-rubik' : 'font-outfit'}`}
                                            >
                                                {slide.buttonText}
                                                {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Center - Main Product Image */}
                                    <div className="lg:col-span-1 flex justify-center">
                                        <div className="relative w-full max-w-sm">
                                            <OptimizedImage
                                                src={slide.productImage}
                                                alt="Featured Product"
                                                width={400}
                                                height={400}
                                                className="w-full h-auto object-contain"
                                                transformation={[
                                                    { width: 400, height: 400, quality: 90 }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {/* Right - Side Images */}
                                    <div className="lg:col-span-1 space-y-4">
                                        {/* Top Side Card */}
                                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="flex-shrink-0 w-20 h-20">
                                                    <OptimizedImage
                                                        src={slide.sideImage1}
                                                        alt={slide.sideText1}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover rounded"
                                                        transformation={[
                                                            { width: 80, height: 80, quality: 85 }
                                                        ]}
                                                    />
                                                </div>
                                                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    <p className={`text-sm font-medium text-gray-900 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                                                        {slide.sideText1}
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        {dict?.hero?.learnMore || 'LEARN MORE'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Side Card */}
                                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="flex-shrink-0 w-20 h-20">
                                                    <OptimizedImage
                                                        src={slide.sideImage2}
                                                        alt={slide.sideText2}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover rounded"
                                                        transformation={[
                                                            { width: 80, height: 80, quality: 85 }
                                                        ]}
                                                    />
                                                </div>
                                                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    <p className={`text-sm font-medium text-gray-900 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                                                        {slide.sideText2}
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        {dict?.hero?.learnMore || 'LEARN MORE'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10`}
                aria-label="Previous slide"
            >
                {isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <button
                onClick={goToNext}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10`}
                aria-label="Next slide"
            >
                {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide ? 'w-8 bg-green-600' : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;