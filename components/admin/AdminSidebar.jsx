'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon } from "lucide-react"
import OptimizedImage from "../OptimizedImage"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useUser } from "@clerk/nextjs"

const AdminSidebar = ({ dict, lang }) => {
    const pathname = usePathname()
    const { user } = useUser()
    const isRTL = lang === 'ar'

    const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Admin'

    const sidebarLinks = [
        { nameKey: 'dashboard', href: `/${lang}/admin`, icon: HomeIcon },
        { nameKey: 'stores', href: `/${lang}/admin/stores`, icon: StoreIcon },
        { nameKey: 'approveStore', href: `/${lang}/admin/approve`, icon: ShieldCheckIcon },
        { nameKey: 'coupons', href: `/${lang}/admin/coupons`, icon: TicketPercentIcon  },
    ]

    return (
        <div className={`inline-flex h-full flex-col gap-5 border-${isRTL ? 'l' : 'r'} border-slate-200 sm:min-w-60`}>
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                {user?.imageUrl ? (
                    <img className="w-14 h-14 rounded-full object-cover" src={user.imageUrl} alt={displayName} />
                ) : (
                    <OptimizedImage className="w-14 h-14 rounded-full" src={assets.gs_logo} alt="Admin" width={80} height={80} />
                )}
                <p className="text-slate-700 font-medium">
                    {dict?.admin?.greeting || 'Hi'}, {displayName}
                </p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <link.icon size={18} className={isRTL ? 'sm:mr-5' : 'sm:ml-5'} />
                            <p className={`max-sm:hidden ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.sidebar?.[link.nameKey] || link.nameKey}
                            </p>
                            {pathname === link.href && <span className={`absolute bg-green-600 ${isRTL ? 'left-0 rounded-r' : 'right-0 rounded-l'} top-1.5 bottom-1.5 w-1 sm:w-1.5`}></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar