'use client'

import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

export default function ProductFeatures({ dict, lang }) {
    const isRTL = lang === 'ar';

    const features = [
        {
            icon: <Truck size={24} />,
            title: dict?.features?.freeDelivery || "Free Delivery",
            description: dict?.features?.freeDeliveryDesc || "On orders above 100 AED"
        },
        {
            icon: <Shield size={24} />,
            title: dict?.features?.genuineProducts || "100% Genuine",
            description: dict?.features?.genuineDesc || "Authentic products guaranteed"
        },
        {
            icon: <RefreshCw size={24} />,
            title: dict?.features?.easyReturns || "Easy Returns",
            description: dict?.features?.returnsDesc || "7-day return policy"
        },
        {
            icon: <Headphones size={24} />,
            title: dict?.features?.support || "24/7 Support",
            description: dict?.features?.supportDesc || "Dedicated customer service"
        }
    ];

    return (
        <div className="mt-12 mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">
                {dict?.product?.whyChooseUs || "Why Choose Alwathba Fresh Market"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                        <div className="p-2 bg-white rounded-lg text-green-600">
                            {feature.icon}
                        </div>
                        <div className={isRTL ? 'text-right' : ''}>
                            <h4 className="font-medium text-slate-800">
                                {feature.title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}