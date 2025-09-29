'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import { ArrowRight, ArrowLeft, Tag, User } from 'lucide-react';

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
      title: dict?.news?.articles?.[0]?.title || "Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.",
      category: dict?.news?.category || "Food",
      author: dict?.news?.author || "Admin",
    },
    {
      id: 2,
      date: {
        day: "29",
        month: dict?.news?.months?.jan || "JAN"
      },
      image: "https://ik.imagekit.io/osmanabdout/assets/blog-02.jpg?updatedAt=1759170873497",
      title: dict?.news?.articles?.[1]?.title || "Eget lobortis lorem lacinia. Vivamus pharetra semper,",
      category: dict?.news?.category || "Food",
      author: dict?.news?.author || "Admin",
    },
    {
      id: 3,
      date: {
        day: "21",
        month: dict?.news?.months?.feb || "FEB"
      },
      image: "https://ik.imagekit.io/osmanabdout/assets/blog-03.jpg?updatedAt=1759170873628",
      title: dict?.news?.articles?.[2]?.title || "Maecenas blandit risus elementum mauris malesuada.",
      category: dict?.news?.category || "Food",
      author: dict?.news?.author || "Admin",
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
          <article
            key={news.id}
            className="bg-white rounded-md overflow-hidden border border-gray-200 hover:border-transparent hover:shadow-md transition-all duration-300 group"
          >
            <div className="relative">
              <OptimizedImage
                src={news.image}
                alt={news.title}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
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
              <div className={`flex items-center gap-4 mb-4 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Tag className="w-4 h-4" />
                  <span className={isRTL ? 'font-rubik' : 'font-outfit'}>
                    {news.category}
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User className="w-4 h-4" />
                  <span className={isRTL ? 'font-rubik' : 'font-outfit'}>
                    {dict?.news?.by || 'By'} {news.author}
                  </span>
                </div>
              </div>

              <h3
                className={`text-xl font-semibold mb-4 leading-tight text-gray-800 hover:text-green-600 transition-colors cursor-pointer line-clamp-2 ${isRTL ? 'font-rubik text-right' : 'font-outfit text-left'}`}
              >
                {news.title}
              </h3>

              <Link
                href={`/${lang}/blog/${news.id}`}
                className={`inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors ${isRTL ? 'flex-row-reverse font-rubik' : 'font-outfit'}`}
              >
                {dict?.news?.readMore || 'Read More'}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;