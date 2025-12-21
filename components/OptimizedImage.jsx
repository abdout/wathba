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
    sizes,
    onLoad,
    ...props
}) {
    // Handle different src formats
    let imageSrc = src;

    if (typeof src === 'string' && !src.includes('http')) {
        // For relative paths, construct full ImageKit URL
        const baseUrl = 'https://ik.imagekit.io/osmanabdout';
        const cleanPath = src.startsWith('/') ? src.slice(1) : src;
        imageSrc = `${baseUrl}/${cleanPath}`;
    } else if (typeof src === 'string' && src.includes('ik.imagekit.io')) {
        imageSrc = src;
    }

    // Build transformation string for ImageKit
    const transforms = [];

    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    transforms.push(`q-${quality}`);
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
    if (transforms.length > 0 && imageSrc && imageSrc.includes('ik.imagekit.io')) {
        const urlParts = imageSrc.split('ik.imagekit.io/osmanabdout/');
        if (urlParts.length === 2) {
            finalUrl = `${urlParts[0]}ik.imagekit.io/osmanabdout/tr:${transforms.join(',')}/${urlParts[1]}`;
        }
    }

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
    delete imgProps.fill;
    delete imgProps.placeholder;
    delete imgProps.transformation;

    if (fill) {
        return (
            <div className="relative" style={{ width: '100%', height: '100%' }}>
                <img
                    src={finalUrl}
                    alt={alt || ''}
                    className={className}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    style={imgStyle}
                    onLoad={onLoad}
                    sizes={sizes}
                    {...imgProps}
                />
            </div>
        );
    }

    return (
        <img
            src={finalUrl}
            alt={alt || ''}
            width={width}
            height={height}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={props.style}
            onLoad={onLoad}
            sizes={sizes}
            {...imgProps}
        />
    );
}
