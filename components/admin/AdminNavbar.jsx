'use client'
import Link from "next/link"
import OptimizedImage from "../OptimizedImage"
import LanguageSwitcher from "../LanguageSwitcher"
import { assets } from "@/assets/assets"

const AdminNavbar = ({ dict, lang }) => {
    const isRTL = lang === 'ar'

    return (
        <div className={`flex items-center justify-between px-12 py-4 border-b border-slate-200 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href={`/${lang}`} className="relative">
                <OptimizedImage
                    src={isRTL ? assets.logo_ar : assets.logo_en}
                    alt={dict?.admin?.logoAlt || "Alwathba Coop Admin"}
                    width={140}
                    height={45}
                    className="h-11 w-auto"
                />
                <span className={`absolute text-xs font-semibold -top-2 ${isRTL ? '-left-16' : '-right-16'} px-3 py-1 rounded-full flex items-center gap-2 text-white bg-green-600`}>
                    {dict?.admin?.badge || "Admin"}
                </span>
            </Link>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p className="text-slate-700 font-medium">
                    {dict?.admin?.greeting || "Hi, Admin"}
                </p>
                <LanguageSwitcher lang={lang} />
            </div>
        </div>
    )
}

export default AdminNavbar