'use client'
import React, { useState, useEffect } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import Hero01 from './Hero01'
import Hero02 from './Hero02'
import Hero03 from './Hero03'
import Hero04 from './Hero04'

const Hero = ({ dict, lang }) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const totalSlides = 4

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides)
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(interval)
    }, [])



    return (
        <div>
            {/* Render Hero based on current slide */}
            <div className='relative'>
                {currentSlide === 0 && <Hero01 dict={dict} lang={lang} />}
                {currentSlide === 1 && <Hero02 dict={dict} lang={lang} />}
                {currentSlide === 2 && <Hero03 dict={dict} lang={lang} />}
                {currentSlide === 3 && <Hero04 dict={dict} lang={lang} />}

                {/* Slide Indicators */}
                <div className='absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentSlide
                                    ? 'bg-green-600 w-6'
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Hero