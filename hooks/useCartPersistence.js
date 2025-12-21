'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, fetchCart, cleanupCart } from '@/lib/features/cart/cartSlice';

const CART_STORAGE_KEY = 'gocart_guest_cart';

// Safe localStorage check - Node.js 21+ has broken localStorage without proper config
const getStorage = () => {
    if (typeof window === 'undefined') return null;
    if (typeof window.localStorage?.getItem !== 'function') return null;
    return window.localStorage;
};

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
        // Clean up any invalid cart entries on mount
        dispatch(cleanupCart());

        const storage = getStorage();
        if (!isAuthenticated && storage) {
            try {
                const savedCart = storage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    if (Object.keys(parsedCart).length > 0) {
                        dispatch(setCart(parsedCart));
                    }
                }
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
                storage.removeItem(CART_STORAGE_KEY);
            }
        }
    }, [isAuthenticated, dispatch]);

    // Save cart to localStorage when it changes (for guest users)
    useEffect(() => {
        const storage = getStorage();
        if (!storage) return;
        if (!isAuthenticated && Object.keys(cart).length > 0) {
            try {
                storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            } catch (error) {
                console.error('Failed to save cart to localStorage:', error);
            }
        }
    }, [cart, isAuthenticated]);

    // Clear localStorage cart when user logs in (cart will be loaded from backend)
    useEffect(() => {
        const storage = getStorage();
        if (!storage) return;
        if (isAuthenticated) {
            storage.removeItem(CART_STORAGE_KEY);
        }
    }, [isAuthenticated]);

    // Merge guest cart with user cart when logging in
    const mergeGuestCart = async () => {
        const storage = getStorage();
        if (!storage) return;
        try {
            const guestCart = storage.getItem(CART_STORAGE_KEY);
            if (guestCart && isAuthenticated) {
                const parsedGuestCart = JSON.parse(guestCart);

                // TODO: Implement API endpoint to merge guest cart with user cart
                // For now, the guest cart will be cleared and user cart loaded from backend

                storage.removeItem(CART_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to merge guest cart:', error);
        }
    };

    return { mergeGuestCart };
}