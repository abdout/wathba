import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import { getDictionary } from "@/components/internationalization/dictionaries";
import GoogleOneTapAuth from "@/components/GoogleOneTap";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

export default async function Home({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <PublicLayoutWithTranslations dict={dict} lang={lang}>
            <div>
                <Hero dict={dict} lang={lang} />
                <LatestProducts dict={dict} lang={lang} />
                <BestSelling dict={dict} lang={lang} />
                <OurSpecs dict={dict} />
                <Newsletter dict={dict} lang={lang} />
                <GoogleOneTapAuth />
            </div>
        </PublicLayoutWithTranslations>
    );
}