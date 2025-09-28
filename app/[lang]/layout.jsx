import { Outfit, Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { getDictionary } from "@/components/internationalization/dictionaries";
import { i18n, isRTL } from "@/components/internationalization/config";
import { ClerkProvider } from '@clerk/nextjs';
import AuthSync from "@/components/AuthSync";
import ImageKitProvider from "@/components/ImageKitProvider";
import ProductDataLoader from "@/components/ProductDataLoader";
import "../globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });
const rubik = Rubik({ subsets: ["arabic"], weight: ["400", "500", "600"] });

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return {
        title: dict.metadata.title,
        description: dict.metadata.description,
        icons: {
            icon: '/favicon.png',
            shortcut: '/favicon.png',
            apple: '/favicon.png',
        },
    };
}

export default async function LocaleLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const rtl = isRTL(lang);
    const fontClass = lang === 'ar' ? rubik.className : outfit.className;

    return (
        <html lang={lang} dir={rtl ? "rtl" : "ltr"}>
            <body className={`${fontClass} antialiased`}>
                <ClerkProvider>
                    <StoreProvider>
                        <ImageKitProvider>
                            <AuthSync>
                                <ProductDataLoader>
                                    <Toaster />
                                    {children}
                                </ProductDataLoader>
                            </AuthSync>
                        </ImageKitProvider>
                    </StoreProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}