import AdminLayout from "@/components/admin/AdminLayout";
import { getDictionary } from "@/components/internationalization/dictionaries";

export const metadata = {
    title: "Al Wathba Coop - Admin",
    description: "Al Wathba Coop - Admin Dashboard",
};

export default async function RootAdminLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <AdminLayout dict={dict} lang={lang}>
                {children}
            </AdminLayout>
        </>
    );
}