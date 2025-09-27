import ProductPage from '@/components/ProductPage';
import { getDictionary } from '@/lib/getDictionary';

export default async function Product({ params }) {
    const dict = await getDictionary(params.lang);

    return <ProductPage dict={dict} lang={params.lang} />;
}