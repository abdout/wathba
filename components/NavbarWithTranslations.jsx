'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocale } from "@/components/internationalization/use-locale";
import { assets } from "@/assets/assets";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";

const NavbarWithTranslations = ({ dict, lang }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isRTL } = useLocale();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/${lang}/shop?search=${search}`)
    }

    // Helper function to get localized paths
    const getLocalizedPath = (path) => {
        if (path === '/') return `/${lang}`;
        return `/${lang}${path}`;
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href={getLocalizedPath('/')}>
                        <Image
                            src={lang === 'ar' ? assets.logo_ar : assets.logo_en}
                            alt="GoCart Logo"
                            height={40}
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href={getLocalizedPath('/')}>{dict.navigation.home}</Link>
                        <Link href={getLocalizedPath('/shop')}>{dict.navigation.shop}</Link>
                        <Link href={getLocalizedPath('/about')}>{dict.navigation.about}</Link>
                        <Link href={getLocalizedPath('/')}>{dict.navigation.contact}</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input
                                className="w-full bg-transparent outline-none placeholder-slate-600"
                                type="text"
                                placeholder={dict.navigation.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                required
                            />
                        </form>

                        <Link href={getLocalizedPath('/cart')} className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher currentLocale={lang} />

                        <button className="px-8 py-2 bg-[#1D77B6] hover:bg-[#1a6aa3] transition text-white rounded-full">
                            {dict.navigation.login}
                        </button>
                    </div>

                    {/* Mobile Menu  */}
                    <div className="sm:hidden flex items-center gap-1">
                        <Link href={getLocalizedPath('/cart')} className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher currentLocale={lang} />

                        <button className="ml-2 px-7 py-1.5 bg-[#1D77B6] hover:bg-[#1a6aa3] text-sm transition text-white rounded-full">
                            {dict.navigation.login}
                        </button>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default NavbarWithTranslations