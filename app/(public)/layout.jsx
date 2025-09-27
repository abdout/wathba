'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreProvider from "@/app/StoreProvider";

// Prevent pre-rendering on server due to Redux in Navbar
export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }) {

    return (
        <StoreProvider>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </StoreProvider>
    );
}
