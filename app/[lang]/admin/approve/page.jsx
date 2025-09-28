import AdminApprove from "@/components/admin/AdminApprove";
import { getDictionary } from "@/components/internationalization/dictionaries";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function AdminApprovePage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <AdminApprove dict={dict} lang={lang} />;
}