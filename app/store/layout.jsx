import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Alwathba. - Store Dashboard",
    description: "Alwathba. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
