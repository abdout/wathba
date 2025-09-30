import { getDictionary } from "@/components/internationalization/dictionaries";
import AdminCouponsClient from "@/components/admin/AdminCouponsClient";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <AdminCouponsClient dict={dict} lang={lang} />;
}