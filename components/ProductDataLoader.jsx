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
    console.log('=== ProductDataLoader DEBUG START ===');
    console.log('[ProductDataLoader] Component mounted at:', new Date().toISOString());
    console.log('[ProductDataLoader] Current products in Redux:', products);
    console.log('[ProductDataLoader] Products length:', products.length);
    console.log('[ProductDataLoader] Loading state:', loading);
    console.log('[ProductDataLoader] Error state:', error);

    // Fetch products from API on initial load
    console.log('[ProductDataLoader] Dispatching fetchProducts action...');

    const fetchPromise = dispatch(fetchProducts({
      limit: 50 // Fetch more products initially
    }));

    fetchPromise.then(result => {
      console.log('[ProductDataLoader] Fetch completed successfully');
      console.log('[ProductDataLoader] Result type:', result.type);
      console.log('[ProductDataLoader] Result payload:', result.payload);

      if (result.payload) {
        console.log('[ProductDataLoader] Products received:', result.payload.products?.length || 0);
        console.log('[ProductDataLoader] First product:', result.payload.products?.[0]);
        console.log('[ProductDataLoader] Pagination:', result.payload.pagination);
      }
    }).catch(err => {
      console.error('[ProductDataLoader] ERROR fetching products:', err);
      console.error('[ProductDataLoader] Error stack:', err.stack);
    });

    console.log('=== ProductDataLoader DEBUG END ===');

    return () => {
      console.log('[ProductDataLoader] Component unmounting...');
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