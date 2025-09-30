import { getDictionary } from "@/components/internationalization/dictionaries";
import AdminStoresClient from "@/components/admin/AdminStoresClient";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function AdminStoresPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <AdminStoresClient dict={dict} lang={lang} />;
}