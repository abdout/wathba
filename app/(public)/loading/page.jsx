'use client'

import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default function LoadingPage() {
    const router = useRouter()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const url = params.get('nextUrl')

        if (url) {
            setTimeout(() => {
                router.push(url)
            }, 8000)
        }
    }, [router])

    return <Loading />
}
