'use client';

import { useCartPersistence } from '@/hooks/useCartPersistence';

export default function CartPersistence({ children }) {
    // This component uses the cart persistence hook to manage cart state
    // for both authenticated and guest users
    useCartPersistence();

    return children;
}