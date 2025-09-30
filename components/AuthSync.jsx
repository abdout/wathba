'use client'

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setLoading } from '@/lib/features/authSlice';
import { fetchCart, clearCart } from '@/lib/features/cart/cartSlice';

export default function AuthSync({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoaded) {
      dispatch(setLoading(true));
      return;
    }

    if (isSignedIn && user) {
      // Create a plain serializable object before dispatching
      const plainUser = JSON.parse(JSON.stringify(user));
      dispatch(setUser({ user: plainUser }));

      // Fetch user's cart from backend when they sign in
      dispatch(fetchCart()).catch(error => {
        console.error('Failed to fetch cart:', error);
      });
    } else {
      dispatch(clearUser());
      // Clear cart when user signs out
      dispatch(clearCart());
    }
  }, [user, isLoaded, isSignedIn, dispatch]);

  return children;
}