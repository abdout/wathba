'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import ProductDataLoader from "@/components/ProductDataLoader";
import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import ProductDescriptionSkeleton from "@/components/skeletons/ProductDescriptionSkeleton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProductPage({ dict, lang }) {
    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state?.product?.list || []);
    const loading = useSelector(state => state?.product?.loading);
    const error = useSelector(state => state?.product?.error);
    const isRTL = lang === 'ar';

    // Enhanced debug logging for production
    console.log('========== ProductPage Debug Start ==========');
    console.log('[ProductPage] Timestamp:', new Date().toISOString());
    console.log('[ProductPage] Environment:', process.env.NODE_ENV);
    console.log('[ProductPage] Component mounted/updated');
    console.log('[ProductPage] productId from params:', productId);
    console.log('[ProductPage] Redux loading state:', loading);
    console.log('[ProductPage] Redux error state:', error);
    console.log('[ProductPage] products from Redux store:', products);
    console.log('[ProductPage] products.length:', products.length);
    console.log('[ProductPage] Current product state:', product);
    console.log('[ProductPage] Full Redux state check:', {
        hasProducts: products.length > 0,
        productsType: typeof products,
        isArray: Array.isArray(products),
        firstProduct: products[0],
        productIds: products.map(p => ({ id: p?.id, name: p?.name }))
    });
    console.log('========== ProductPage Debug End ==========');

    const fetchProduct = async () => {
        console.log('========== fetchProduct Debug Start ==========');
        console.log('[fetchProduct] Called at:', new Date().toISOString());
        console.log('[fetchProduct] Searching for product with ID:', productId);
        console.log('[fetchProduct] Type of productId:', typeof productId);
        console.log('[fetchProduct] Available products count:', products.length);
        console.log('[fetchProduct] Available product IDs:', products.map(p => ({
            id: p?.id,
            idType: typeof p?.id,
            name: p?.name
        })));

        // Try to find product with type coercion check
        const product = products.find((product) => {
            const match = product.id === productId;
            const matchString = String(product.id) === String(productId);
            console.log(`[fetchProduct] Checking product ${product.id}:`, {
                strictMatch: match,
                stringMatch: matchString,
                productIdValue: product.id,
                searchIdValue: productId
            });
            return match || matchString;
        });

        console.log('[fetchProduct] Found product:', product);
        console.log('[fetchProduct] Product details:', product ? {
            id: product.id,
            name: product.name,
            hasImages: !!product.images,
            imagesCount: product.images?.length,
            hasRating: !!product.rating,
            hasStore: !!product.store
        } : 'No product found');
        console.log('========== fetchProduct Debug End ==========');

        setProduct(product);
    }

    useEffect(() => {
        console.log('========== useEffect Debug Start ==========');
        console.log('[useEffect] Triggered at:', new Date().toISOString());
        console.log('[useEffect] Dependencies - productId:', productId);
        console.log('[useEffect] Dependencies - products.length:', products.length);
        console.log('[useEffect] Redux loading:', loading);
        console.log('[useEffect] Redux error:', error);

        if (products.length > 0) {
            console.log('[useEffect] Products available, calling fetchProduct');
            fetchProduct()
        } else {
            console.log('[useEffect] No products available in Redux store');
            console.log('[useEffect] Will wait for products to load...');
        }
        scrollTo(0, 0)
        console.log('========== useEffect Debug End ==========');
    }, [productId, products]);

    // Get translated product name
    const getProductName = (product) => {
        return dict?.productNames?.[product.name] || product.name;
    };

    // Get translated category
    const getCategoryName = (category) => {
        return dict?.categories?.[category] || category;
    };

    return (
        <ProductDataLoader>
            <div className="mx-6">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className={`text-gray-600 text-sm mt-8 mb-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span>{dict?.navigation?.home || "Home"}</span>
                        <span className="mx-2">/</span>
                        <span>{dict?.products?.title || "Latest Products"}</span>
                        <span className="mx-2">/</span>
                        <span>{product && getCategoryName(product.category)}</span>
                    </div>

                    {/* Loading State with Skeleton */}
                    {loading && !product && (
                        <>
                            <ProductDetailsSkeleton />
                            <ProductDescriptionSkeleton />
                        </>
                    )}

                    {/* Error State */}
                    {error && !product && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
                            <p className="text-lg mb-2">{dict?.errors?.productLoadFailed || "Failed to load product"}</p>
                            <p className="text-sm text-gray-600">Error: {error}</p>
                            <p className="text-xs text-gray-500 mt-2">Product ID: {productId}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                            >
                                {dict?.common?.retry || "Retry"}
                            </button>
                        </div>
                    )}

                    {/* No Product Found State */}
                    {!loading && !error && !product && products.length > 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                            <p className="text-lg mb-2">{dict?.errors?.productNotFound || "Product not found"}</p>
                            <p className="text-sm">Product ID: {productId}</p>
                            <p className="text-xs mt-2">Available products: {products.length}</p>
                            <a href={`/${lang}/shop`} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900">
                                {dict?.navigation?.backToShop || "Back to Shop"}
                            </a>
                        </div>
                    )}

                    {/* Product Details */}
                    {product && (
                        <ProductDetails
                            product={{...product, name: getProductName(product)}}
                            dict={dict}
                            lang={lang}
                        />
                    )}

                    {/* Description & Reviews */}
                    {product && (
                        <ProductDescription
                            product={{...product, name: getProductName(product)}}
                            dict={dict}
                            lang={lang}
                        />
                    )}
                </div>
            </div>
        </ProductDataLoader>
    );
}