'use client';

import React from 'react';

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 80,
    transformation = [],
    fill,
    placeholder,
    ...props
}) {
    // Handle different src formats
    let imageSrc = src;

    if (typeof src === 'string' && !src.includes('http')) {
        // For relative paths, construct full ImageKit URL
        const baseUrl = 'https://ik.imagekit.io/osmanabdout';
        // Remove leading slash if present
        const cleanPath = src.startsWith('/') ? src.slice(1) : src;
        imageSrc = `${baseUrl}/${cleanPath}`;
    } else if (typeof src === 'string' && src.includes('ik.imagekit.io')) {
        // Already a full ImageKit URL, use as-is
        imageSrc = src;
    }

    // Build transformation string for ImageKit
    const transforms = [];

    // Add width/height if specified
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);

    // Add quality
    transforms.push(`q-${quality}`);

    // Add format auto for optimization
    transforms.push('f-auto');

    // Apply custom transformations
    transformation.forEach(t => {
        if (t.width) transforms.push(`w-${t.width}`);
        if (t.height) transforms.push(`h-${t.height}`);
        if (t.quality) transforms.push(`q-${t.quality}`);
        if (t.crop) transforms.push(`c-${t.crop}`);
        if (t.format) transforms.push(`f-${t.format}`);
    });

    // Build final URL with transformations
    let finalUrl = imageSrc;
    if (transforms.length > 0 && imageSrc.includes('ik.imagekit.io')) {
        // Insert transformations into ImageKit URL
        const urlParts = imageSrc.split('ik.imagekit.io/osmanabdout/');
        if (urlParts.length === 2) {
            finalUrl = `${urlParts[0]}ik.imagekit.io/osmanabdout/tr:${transforms.join(',')}/${urlParts[1]}`;
        }
    }

    // For debugging in development (disabled to reduce noise)
    // if (process.env.NODE_ENV === 'development') {
    //     console.log('OptimizedImage:', { original: src, optimized: finalUrl });
    // }

    // Handle fill attribute for absolute positioning
    const imgStyle = fill ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...props.style
    } : props.style;

    // Filter out non-DOM attributes
    const imgProps = { ...props };
    // Remove custom props that shouldn't go to DOM
    delete imgProps.fill;
    delete imgProps.placeholder;
    delete imgProps.transformation;

    return (
        <img
            src={finalUrl}
            alt={alt || ''}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            style={imgStyle}
            {...imgProps}
        />
    );
}