import { getDictionary } from "@/components/internationalization/dictionaries";
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import OrderDetailsPage from "@/components/OrderDetailsPage";

export default async function OrderDetails({ params }) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={lang}>
            <OrderDetailsPage orderId={id} dict={dict} lang={lang} />
        </PublicLayoutWithTranslations>
    );
}