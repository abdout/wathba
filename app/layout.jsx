import { i18n } from "@/components/internationalization/config";

export default function RootLayout({ children }) {
    // Root layout is now minimal - actual layout handled in [lang]/layout.jsx
    return children;
}

// Generate static params for all locales
export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}
