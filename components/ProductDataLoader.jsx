'use client'

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

export default function ProductDataLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch products from API on initial load
    console.log('Fetching products from API...');
    dispatch(fetchProducts({
      limit: 50 // Fetch more products initially
    })).then(result => {
      console.log('Products fetch result:', result);
    }).catch(err => {
      console.error('Error fetching products:', err);
    });
  }, [dispatch]);

  return children;
}