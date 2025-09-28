# ImageKit Integration Guide

## Overview

This e-commerce platform is integrated with ImageKit for real-time image optimization, resizing, and cloud storage. ImageKit provides automatic image transformations, CDN delivery, and efficient upload capabilities.

## Configuration

### Environment Variables

Add the following variables to your `.env.local` file:

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_your_public_key_here
IMAGEKIT_PRIVATE_KEY=private_your_private_key_here
```

Get your credentials from: https://imagekit.io/dashboard/developer/api-keys

## Components

### 1. OptimizedImage Component

A wrapper around ImageKit's Image component that provides automatic optimization.

**Usage:**
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
    src="/product-image.jpg"
    alt="Product Name"
    width={500}
    height={500}
    transformation={[
        { width: 300, height: 300, quality: 85 }
    ]}
/>
```

**Props:**
- `src`: Image path (relative or absolute)
- `alt`: Alt text for accessibility
- `width`: Display width
- `height`: Display height
- `transformation`: Array of transformation objects
- `className`: CSS classes
- `priority`: Load immediately (default: lazy)

### 2. ImageKitUpload Component

Handles file uploads with progress tracking and error handling.

**Usage:**
```jsx
import ImageKitUpload from '@/components/ImageKitUpload';

<ImageKitUpload
    onUploadSuccess={(data) => {
        console.log('Upload successful:', data.url);
    }}
    folder="/products"
    maxSize={5}
    buttonText="Upload Product Image"
/>
```

**Props:**
- `onUploadSuccess`: Callback function after successful upload
- `folder`: Destination folder in ImageKit (default: `/products`)
- `accept`: File types to accept (default: `image/*`)
- `maxSize`: Maximum file size in MB (default: 5)
- `buttonText`: Button label text

**Upload Response Data:**
```javascript
{
    url: "https://ik.imagekit.io/...",
    fileId: "file_id",
    filePath: "/products/image.jpg",
    thumbnail: "thumbnail_url",
    width: 1920,
    height: 1080
}
```

### 3. ImageKitProvider Component

Provides ImageKit configuration to child components.

**Usage:**
```jsx
import ImageKitProvider from '@/components/ImageKitProvider';

<ImageKitProvider>
    {/* Your components */}
</ImageKitProvider>
```

## API Routes

### /api/imagekit-auth

Generates authentication parameters for secure file uploads. This route:
- Validates user authentication via Clerk
- Generates upload tokens with 30-minute expiry
- Returns signature, token, expire, and public key

## Image Transformations

### Common Transformation Options

```javascript
// Resize with quality optimization
transformation={[
    { width: 300, height: 300, quality: 85 }
]}

// Thumbnail generation
transformation={[
    { width: 150, height: 150, crop: "at_max" }
]}

// Progressive loading with blur
transformation={[
    { quality: 10, blur: 90 }
]}

// Format conversion
transformation={[
    { format: "webp", quality: 80 }
]}

// Smart crop with focus
transformation={[
    { width: 500, height: 500, crop: "at_least", focus: "auto" }
]}
```

### Responsive Images

The OptimizedImage component automatically generates responsive images with srcset for optimal loading across devices.

## Implementation Examples

### Product Card
```jsx
<OptimizedImage
    src={product.images[0]}
    alt={product.name}
    width={500}
    height={500}
    transformation={[
        { width: 300, height: 300, quality: 85 }
    ]}
/>
```

### Product Details Gallery
```jsx
// Main image
<OptimizedImage
    src={mainImage}
    alt={product.name}
    width={250}
    height={250}
    transformation={[
        { width: 500, height: 500, quality: 90 }
    ]}
/>

// Thumbnails
<OptimizedImage
    src={image}
    alt={product.name}
    width={45}
    height={45}
    transformation={[
        { width: 90, height: 90, quality: 80 }
    ]}
/>
```

### Cart Items
```jsx
<OptimizedImage
    src={item.images[0]}
    alt={item.name}
    width={45}
    height={45}
    transformation={[
        { width: 90, height: 90, quality: 80 }
    ]}
/>
```

## Best Practices

### 1. Image Optimization
- Use appropriate quality settings (80-90 for main images, 70-80 for thumbnails)
- Specify exact dimensions needed to avoid oversized downloads
- Use WebP format for better compression when possible

### 2. Lazy Loading
- Default behavior is lazy loading for below-fold images
- Use `priority` prop for above-fold critical images

### 3. Folder Organization
```
/products         - Product images
/stores          - Store logos and banners
/categories      - Category images
/users          - User avatars
/banners        - Promotional banners
```

### 4. Upload Validation
- Set appropriate file size limits
- Validate file types on client and server
- Use unique filenames to prevent conflicts

### 5. Error Handling
```javascript
try {
    const result = await upload({...});
    // Handle success
} catch (error) {
    if (error instanceof ImageKitAbortError) {
        // Handle abort
    } else if (error instanceof ImageKitUploadNetworkError) {
        // Handle network error
    }
    // ... other error types
}
```

## Security Considerations

1. **Private Key Protection**: Never expose `IMAGEKIT_PRIVATE_KEY` in client-side code
2. **Authentication**: Upload routes require user authentication via Clerk
3. **Token Expiry**: Upload tokens expire after 30 minutes
4. **File Validation**: Implement server-side validation for file types and sizes

## Performance Benefits

- **Automatic Optimization**: Images are automatically optimized based on device and network
- **CDN Delivery**: Global CDN ensures fast loading worldwide
- **Format Conversion**: Automatic WebP/AVIF conversion for supported browsers
- **Responsive Images**: Automatic srcset generation for optimal resolution
- **Lazy Loading**: Built-in lazy loading reduces initial page load

## Troubleshooting

### Common Issues

1. **Images not loading**: Check environment variables are set correctly
2. **Upload fails**: Verify authentication and API keys
3. **Transformation errors**: Ensure transformation parameters are valid
4. **CORS issues**: Check ImageKit dashboard settings

### Debug Mode

Enable debug logging in components:
```javascript
if (!urlEndpoint) {
    console.error('ImageKit URL endpoint is not configured');
}
```

## Migration from Local Images

To migrate existing local images to ImageKit:

1. Upload images via ImageKit dashboard or API
2. Update image paths in database
3. Replace `<Image>` with `<OptimizedImage>`
4. Add appropriate transformations

## Additional Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [Next.js ImageKit SDK](https://github.com/imagekit-developer/imagekit-next)
- [ImageKit Dashboard](https://imagekit.io/dashboard)
- [Transformation Reference](https://docs.imagekit.io/features/transformations)