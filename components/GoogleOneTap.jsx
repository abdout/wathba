'use client';

import { GoogleOneTap } from '@clerk/nextjs';

export default function GoogleOneTapAuth() {
  return (
    <GoogleOneTap
      appearance={{
        elements: {
          rootBox: {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
          },
        },
      }}
    />
  );
}