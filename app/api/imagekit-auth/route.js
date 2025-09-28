import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        // Check if user is authenticated
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate environment variables
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

        if (!privateKey || !publicKey) {
            console.error('ImageKit keys not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Generate authentication parameters
        const { token, expire, signature } = getUploadAuthParams({
            privateKey,
            publicKey,
            expire: 30 * 60, // 30 minutes
        });

        return NextResponse.json({
            token,
            expire,
            signature,
            publicKey
        });
    } catch (error) {
        console.error('ImageKit auth error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload credentials' },
            { status: 500 }
        );
    }
}