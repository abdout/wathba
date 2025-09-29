'use client'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

export default function ProductDataLoader({ children }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state?.product?.list || []);
  const loading = useSelector(state => state?.product?.loading);
  const error = useSelector(state => state?.product?.error);

  useEffect(() => {
    console.log('========== ProductDataLoader DEBUG START ==========');
    console.log('[ProductDataLoader] Timestamp:', new Date().toISOString());
    console.log('[ProductDataLoader] Environment:', process.env.NODE_ENV);
    console.log('[ProductDataLoader] API URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');
    console.log('[ProductDataLoader] Current window location:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log('[ProductDataLoader] Component mounted');
    console.log('[ProductDataLoader] Redux State:', {
      productsLength: products.length,
      loading: loading,
      error: error,
      hasError: !!error,
      errorMessage: error?.message || error,
      firstProduct: products[0]
    });

    // Check if we already have products
    if (products.length > 0) {
      console.log('[ProductDataLoader] Products already loaded, count:', products.length);
      console.log('[ProductDataLoader] Sample product IDs:', products.slice(0, 3).map(p => p?.id));
      return;
    }

    console.log('[ProductDataLoader] No products in store, fetching from API...');
    console.log('[ProductDataLoader] Dispatching fetchProducts action with limit: 50');

    const fetchPromise = dispatch(fetchProducts({
      limit: 50
    }));

    fetchPromise
      .then(result => {
        console.log('========== Fetch Success ==========');
        console.log('[ProductDataLoader] Fetch completed at:', new Date().toISOString());
        console.log('[ProductDataLoader] Action type:', result.type);
        console.log('[ProductDataLoader] Success type check:', result.type.endsWith('/fulfilled'));

        if (result.type.endsWith('/rejected')) {
          console.error('[ProductDataLoader] Fetch was rejected!');
          console.error('[ProductDataLoader] Rejection payload:', result.payload);
          console.error('[ProductDataLoader] Error details:', result.error);
        }

        if (result.payload) {
          console.log('[ProductDataLoader] Payload received:', {
            hasProducts: !!result.payload.products,
            productsCount: result.payload.products?.length || 0,
            pagination: result.payload.pagination,
            error: result.payload.error,
            message: result.payload.message
          });

          if (result.payload.products && result.payload.products.length > 0) {
            console.log('[ProductDataLoader] First product details:', {
              id: result.payload.products[0]?.id,
              name: result.payload.products[0]?.name,
              hasImages: !!result.payload.products[0]?.images,
              hasStore: !!result.payload.products[0]?.store
            });
          } else {
            console.warn('[ProductDataLoader] No products in payload!');
          }
        } else {
          console.error('[ProductDataLoader] No payload in result!');
        }
        console.log('========== Fetch Complete ==========');
      })
      .catch(err => {
        console.error('========== Fetch Error ==========');
        console.error('[ProductDataLoader] ERROR at:', new Date().toISOString());
        console.error('[ProductDataLoader] Error message:', err.message);
        console.error('[ProductDataLoader] Error stack:', err.stack);
        console.error('[ProductDataLoader] Full error object:', err);
        console.error('[ProductDataLoader] Error name:', err.name);
        console.error('[ProductDataLoader] Error code:', err.code);
        console.error('========== Error End ==========');
      });

    console.log('[ProductDataLoader] Fetch promise dispatched');
    console.log('========== ProductDataLoader DEBUG END ==========');

    return () => {
      console.log('[ProductDataLoader] Component unmounting at:', new Date().toISOString());
    };
  }, [dispatch]);

  // Monitor Redux state changes
  useEffect(() => {
    console.log('[ProductDataLoader] Redux state updated - products count:', products.length);
    if (products.length > 0) {
      console.log('[ProductDataLoader] First product in Redux:', products[0]);
    }
  }, [products]);

  return children;
}