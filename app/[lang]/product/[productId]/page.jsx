import ProductPage from '@/components/ProductPage';
import { getDictionary } from '@/lib/getDictionary';

// Prevent pre-rendering on server due to Redux in ProductPage
export const dynamic = 'force-dynamic';

export default async function Product({ params }) {
    const dict = await getDictionary(params.lang);

    return <ProductPage dict={dict} lang={params.lang} />;
}