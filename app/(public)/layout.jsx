'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Prevent pre-rendering on server due to Redux in Navbar
export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
