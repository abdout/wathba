'use client';

import { Image } from '@imagekit/next';
import { useState, useEffect } from 'react';

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality,
    transformation = [],
    placeholder = 'empty',
    onError,
    sizes,
    ...props
}) {
    const [imgError, setImgError] = useState(false);

    // Debug logging
    useEffect(() => {
        if (src) {
            console.log('OptimizedImage loading:', { src });
        }
    }, [src]);

    // Handle error fallback
    const handleError = (e) => {
        console.error('Image load error:', {
            src,
            errorType: e?.type || 'unknown',
            errorMessage: e?.message || 'Image failed to load'
        });
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

    // Process src to handle different formats
    let imageSrc = src;
    if (typeof src === 'string') {
        if (src.includes('ik.imagekit.io')) {
            // Extract path from full ImageKit URL
            try {
                const url = new URL(src);
                // Remove the leading slash from pathname
                imageSrc = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                console.log('Extracted path from ImageKit URL:', { original: src, extracted: imageSrc });
            } catch {
                imageSrc = src;
            }
        } else if (src.startsWith('/')) {
            // Remove leading slash for ImageKit paths
            imageSrc = src.slice(1);
        } else {
            // Use as-is
            imageSrc = src;
        }
    }

    console.log('Final image src:', { original: src, processed: imageSrc });

    // Build optimized transformations
    const optimizedTransformations = [...transformation];

    // Add quality if not specified
    if (!transformation.find(t => t.quality) && quality) {
        optimizedTransformations.push({ quality });
    }

    // Auto format for better compression
    if (!transformation.find(t => t.format)) {
        optimizedTransformations.push({ format: 'auto' });
    }

    // Add responsive transformations if width/height specified
    if (width && height && !transformation.find(t => t.width || t.height)) {
        optimizedTransformations.push({
            width: width * 2, // 2x for retina
            height: height * 2,
            crop: 'at_max',
            quality: quality || 80
        });
    }

    return (
        <Image
            src={imageSrc}
            alt={alt || ''}
            width={width || 500}
            height={height || 500}
            className={className}
            transformation={optimizedTransformations}
            loading={priority ? 'eager' : 'lazy'}
            onError={handleError}
            sizes={sizes || `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`}
            placeholder={placeholder}
            {...props}
        />
    );
}