'use client'

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

export default function ProductDataLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch products from API on initial load
    dispatch(fetchProducts({
      limit: 50 // Fetch more products initially
    }));
  }, [dispatch]);

  return children;
}