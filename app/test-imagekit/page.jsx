'use client';

import { Image } from '@imagekit/next';
import OptimizedImage from '@/components/OptimizedImage';
import ImageKitProvider from '@/components/ImageKitProvider';
import { assets } from '@/assets/assets';

export default function TestImageKit() {
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/osmanabdout';
    console.log('ImageKit URL Endpoint:', urlEndpoint);
    console.log('Asset URL from object:', assets.logo_en);

    // Test different URL formats
    const testImages = [
        {
            src: 'assets/logo-en.svg',
            label: 'Direct path (no leading slash)'
        },
        {
            src: '/assets/logo-en.svg',
            label: 'Path with leading slash'
        },
        {
            src: 'https://ik.imagekit.io/osmanabdout/assets/logo-en.svg',
            label: 'Full URL'
        },
        {
            src: assets.logo_en,
            label: 'From assets object'
        }
    ];

    return (
        <ImageKitProvider>
            <div className="p-8">
            <h1 className="text-2xl font-bold mb-8">ImageKit Test Page</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Direct ImageKit Component</h2>
                <div className="grid grid-cols-2 gap-4">
                    {testImages.map((img, idx) => (
                        <div key={idx} className="border p-4">
                            <p className="text-sm mb-2">{img.label}</p>
                            <p className="text-xs text-gray-600 mb-2">src: {img.src}</p>
                            <Image
                                src={img.src}
                                alt="Test"
                                width={100}
                                height={40}
                                transformation={[{ quality: 80 }]}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">OptimizedImage Component</h2>
                <div className="grid grid-cols-2 gap-4">
                    {testImages.map((img, idx) => (
                        <div key={idx} className="border p-4">
                            <p className="text-sm mb-2">{img.label}</p>
                            <p className="text-xs text-gray-600 mb-2">src: {img.src}</p>
                            <OptimizedImage
                                src={img.src}
                                alt="Test"
                                width={100}
                                height={40}
                            />
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </ImageKitProvider>
    );
}