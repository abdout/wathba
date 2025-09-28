import AdminDashboard from "@/components/admin/AdminDashboard";
import { getDictionary } from "@/components/internationalization/dictionaries";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function AdminPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <AdminDashboard dict={dict} lang={lang} />;
}