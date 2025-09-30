'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { ArrowRight, ArrowLeft, Tag } from 'lucide-react';

const LatestNews = ({ dict, lang }) => {
  const isRTL = lang === 'ar';

  const newsData = [
    {
      id: 1,
      date: {
        day: "18",
        month: dict?.news?.months?.nov || "NOV"
      },
      image: "https://ik.imagekit.io/osmanabdout/assets/blog-01.png?updatedAt=1759170873988",
      title: dict?.news?.articles?.[0]?.title || "Fresh Orange Season: Health Benefits and Seasonal Recipes",
      description: dict?.news?.articles?.[0]?.description || "Discover the amazing health benefits of fresh oranges and creative ways to incorporate them into your daily diet",
      category: dict?.news?.categories?.food || "Food",
    },
    {
      id: 2,
      date: {
        day: "29",
        month: dict?.news?.months?.jan || "JAN"
      },
      image: "https://ik.imagekit.io/osmanabdout/assets/blog-02.jpg?updatedAt=1759170873497",
      title: dict?.news?.articles?.[1]?.title || "Premium Olive Oil: Your Guide to Quality and Health",
      description: dict?.news?.articles?.[1]?.description || "Learn how to choose the best olive oil and understand its numerous health benefits for your family",
      category: dict?.news?.categories?.food || "Food",
    },
    {
      id: 3,
      date: {
        day: "21",
        month: dict?.news?.months?.feb || "FEB"
      },
      image: "https://ik.imagekit.io/osmanabdout/assets/blog-03.jpg?updatedAt=1759170873628",
      title: dict?.news?.articles?.[2]?.title || "Smart Washing Machines: Save Water and Energy",
      description: dict?.news?.articles?.[2]?.description || "Explore the latest washing machine technologies that help you save on utility bills while protecting the environment",
      category: dict?.news?.categories?.appliances || "Appliances",
    },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-3xl sm:text-4xl font-bold text-gray-800 mb-2 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
          {dict?.news?.title || 'Latest News'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsData.map((news) => (
          <Link
            key={news.id}
            href={`/${lang}/blog/${news.id}`}
            className="block"
          >
            <article className="bg-white rounded-md overflow-hidden border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 group h-full">
              <div className="relative overflow-hidden">
                <OptimizedImage
                  src={news.image}
                  alt={news.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  transformation={[
                    { width: 400, height: 300, quality: 85 }
                  ]}
                />
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} bg-white bg-opacity-90 rounded px-3 py-1.5 shadow-sm`}>
                  <div className="text-center">
                    <div className={`text-xl font-bold text-gray-800 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                      {news.date.day}
                    </div>
                    <div className={`text-sm text-gray-500 uppercase ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                      {news.date.month}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm text-gray-500 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
                    {news.category}
                  </span>
                </div>

                <h3
                  className={`text-xl font-semibold mb-3 leading-tight text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2 ${isRTL ? 'font-rubik text-right' : 'font-outfit text-left'}`}
                >
                  {news.title}
                </h3>

                <p className={`text-gray-600 mb-4 line-clamp-2 ${isRTL ? 'font-rubik text-right' : 'font-outfit text-left'}`}>
                  {news.description}
                </p>

                <div
                  className={`inline-flex items-center gap-2 text-green-600 font-medium group-hover:text-green-700 transition-colors ${isRTL ? 'flex-row-reverse font-rubik' : 'font-outfit'}`}
                >
                  {dict?.news?.readMore || 'Read More'}
                  {isRTL ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;