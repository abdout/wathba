'use client'

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setLoading } from '@/lib/features/authSlice';

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
    } else {
      dispatch(clearUser());
    }
  }, [user, isLoaded, isSignedIn, dispatch]);

  return children;
}