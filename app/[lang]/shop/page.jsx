import { getDictionary } from "@/components/internationalization/dictionaries";
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import ShopPage from "@/components/ShopPage";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function Shop({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={lang}>
            <ShopPage dict={dict} lang={lang} />
        </PublicLayoutWithTranslations>
    );
}