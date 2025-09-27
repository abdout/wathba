'use client'
import { useRouter, usePathname } from 'next/navigation';
import { i18n, localeConfig } from '@/components/internationalization/config';
import { Languages } from 'lucide-react';
import { useLocale } from '@/components/internationalization/use-locale';

const LanguageSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { locale: currentLocale } = useLocale();

    const toggleLocale = () => {
        // Use default locale if currentLocale is not valid
        const validLocale = i18n.locales.includes(currentLocale) ? currentLocale : i18n.defaultLocale;

        // Get the next locale (toggle between available locales)
        const currentIndex = i18n.locales.indexOf(validLocale);
        const nextIndex = (currentIndex + 1) % i18n.locales.length;
        const targetLocale = i18n.locales[nextIndex];

        // Extract path without locale
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');

        // Construct new path with target locale
        const newPath = `/${targetLocale}${pathWithoutLocale || '/'}`;

        // Set cookie for persistence
        document.cookie = `NEXT_LOCALE=${targetLocale};max-age=31536000;path=/;samesite=lax`;

        router.push(newPath);
        router.refresh();
    };

    const validLocale = i18n.locales.includes(currentLocale) ? currentLocale : i18n.defaultLocale;
    const currentLocaleConfig = localeConfig[validLocale];
    const nextLocale = i18n.locales[(i18n.locales.indexOf(validLocale) + 1) % i18n.locales.length];

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg"
            aria-label={`Switch language - Current: ${currentLocaleConfig?.name || 'English'}`}
            title={`Switch to ${localeConfig[nextLocale]?.name || 'Arabic'}`}
        >
            <Languages size={18} />
        </button>
    );
};

export default LanguageSwitcher;