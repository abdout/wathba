import { Outfit, Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { getDictionary } from "@/components/internationalization/dictionaries";
import { i18n, isRTL } from "@/components/internationalization/config";
import { ClerkProvider } from '@clerk/nextjs';
import AuthSync from "@/components/AuthSync";
import ImageKitProvider from "@/components/ImageKitProvider";
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
            icon: '/assets/logo.svg',
            shortcut: '/assets/logo.svg',
            apple: '/assets/logo.svg',
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
                                <Toaster />
                                {children}
                            </AuthSync>
                        </ImageKitProvider>
                    </StoreProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}