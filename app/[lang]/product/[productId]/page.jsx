import ProductPage from '@/components/ProductPage';
import { getDictionary } from '@/lib/getDictionary';
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";

// Prevent pre-rendering on server due to Redux in ProductPage
export const dynamic = 'force-dynamic';

export default async function Product({ params }) {
    const dict = await getDictionary(params.lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={params.lang}>
            <ProductPage dict={dict} lang={params.lang} productId={params.productId} />
        </PublicLayoutWithTranslations>
    );
}