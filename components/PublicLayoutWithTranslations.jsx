import Banner from "@/components/Banner";
import NavbarWithTranslations from "@/components/NavbarWithTranslations";
import Footer from "@/components/Footer";

export default function PublicLayoutWithTranslations({ children, dict, lang }) {
    return (
        <>
            <Banner dict={dict} lang={lang} />
            <NavbarWithTranslations dict={dict} lang={lang} />
            {children}
            <Footer dict={dict} lang={lang} />
        </>
    );
}