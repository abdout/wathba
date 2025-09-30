'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, fetchCart } from '@/lib/features/cart/cartSlice';

const CART_STORAGE_KEY = 'gocart_guest_cart';

/**
 * Hook to manage cart persistence for both authenticated and guest users
 * - For authenticated users: syncs with backend
 * - For guest users: uses localStorage
 */
export function useCartPersistence() {
    const dispatch = useDispatch();
    const cart = useSelector(state => state?.cart?.cartItems || {});
    const user = useSelector(state => state?.auth?.user);
    const isAuthenticated = !!user;

    // Load cart from localStorage on mount (for guest users)
    useEffect(() => {
        if (!isAuthenticated) {
            try {
                const savedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    if (Object.keys(parsedCart).length > 0) {
                        dispatch(setCart(parsedCart));
                    }
                }
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
                localStorage.removeItem(CART_STORAGE_KEY);
            }
        }
    }, [isAuthenticated, dispatch]);

    // Save cart to localStorage when it changes (for guest users)
    useEffect(() => {
        if (!isAuthenticated && Object.keys(cart).length > 0) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            } catch (error) {
                console.error('Failed to save cart to localStorage:', error);
            }
        }
    }, [cart, isAuthenticated]);

    // Clear localStorage cart when user logs in (cart will be loaded from backend)
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, [isAuthenticated]);

    // Merge guest cart with user cart when logging in
    const mergeGuestCart = async () => {
        try {
            const guestCart = localStorage.getItem(CART_STORAGE_KEY);
            if (guestCart && isAuthenticated) {
                const parsedGuestCart = JSON.parse(guestCart);

                // TODO: Implement API endpoint to merge guest cart with user cart
                // For now, the guest cart will be cleared and user cart loaded from backend

                localStorage.removeItem(CART_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to merge guest cart:', error);
        }
    };

    return { mergeGuestCart };
}