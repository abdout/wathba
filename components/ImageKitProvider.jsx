'use client';

import { ImageKitProvider as IKProvider } from '@imagekit/next';

export default function ImageKitProvider({ children }) {
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!urlEndpoint || !publicKey) {
        console.error('ImageKit configuration is incomplete:', { urlEndpoint: !!urlEndpoint, publicKey: !!publicKey });
        return children;
    }

    return (
        <IKProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            {children}
        </IKProvider>
    );
}