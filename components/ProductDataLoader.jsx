'use client'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

export default function ProductDataLoader({ children }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state?.product?.list || []);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts({ limit: 50 }));
    }
  }, [dispatch, products.length]);

  return children;
}
