'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function OptimizedImageSimple({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 80,
    onError,
    sizes,
    ...props
}) {
    const [imgError, setImgError] = useState(false);

    // Handle error fallback
    const handleError = (e) => {
        console.error('Image load error:', src);
        setImgError(true);
        if (onError) onError(e);
    };

    // If error occurred or no src, show fallback
    if (imgError || !src) {
        return (
            <div
                className={`bg-gray-200 flex items-center justify-center ${className || ''}`}
                style={{ width, height }}
                role="img"
                aria-label={alt || 'Image placeholder'}
            >
                <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    // Ensure src is a full URL
    let imageSrc = src;
    if (typeof src === 'string' && !src.includes('http')) {
        // If it's not a full URL, assume it's an ImageKit path
        const baseUrl = 'https://ik.imagekit.io/osmanabdout';
        imageSrc = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
    }

    // Add ImageKit transformations to the URL
    const getOptimizedUrl = (url) => {
        if (!url.includes('ik.imagekit.io')) return url;

        // Build transformation string
        const transforms = [];
        if (width && height) {
            transforms.push(`w-${width},h-${height}`);
        }
        if (quality) {
            transforms.push(`q-${quality}`);
        }
        transforms.push('f-auto'); // Auto format

        // Insert transformations before the file path
        const parts = url.split('/');
        const filename = parts.pop();
        const basePath = parts.join('/');

        return `${basePath}/tr:${transforms.join(',')}/${filename}`;
    };

    const optimizedSrc = getOptimizedUrl(imageSrc);

    console.log('OptimizedImageSimple:', { original: src, optimized: optimizedSrc });

    return (
        <Image
            src={optimizedSrc}
            alt={alt || ''}
            width={width || 500}
            height={height || 500}
            className={className}
            priority={priority}
            quality={quality}
            onError={handleError}
            sizes={sizes || `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`}
            unoptimized // Use ImageKit optimization instead of Next.js
            {...props}
        />
    );
}