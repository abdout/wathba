'use client';

import { ImageKitProvider as IKProvider } from '@imagekit/next';

export default function ImageKitProvider({ children }) {
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!urlEndpoint) {
        console.error('ImageKit URL endpoint is not configured');
        return children;
    }

    return (
        <IKProvider urlEndpoint={urlEndpoint}>
            {children}
        </IKProvider>
    );
}