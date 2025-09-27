import { getDictionary } from "@/components/internationalization/dictionaries";
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import CartPage from "@/components/CartPage";

export default async function Cart({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={lang}>
            <CartPage dict={dict} lang={lang} />
        </PublicLayoutWithTranslations>
    );
}