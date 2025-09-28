'use client'
import { Search, ShoppingCart, User, Store as StoreIcon, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocale } from "@/components/internationalization/use-locale";
import { assets } from "@/assets/assets";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import OptimizedImage from "./OptimizedImageSimple"; // Using simplified version

const NavbarWithTranslations = ({ dict, lang }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isRTL } = useLocale();
    const { user, isLoaded, isSignedIn } = useUser();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state?.cart?.total || 0)

    const userRole = user?.publicMetadata?.role;
    const isAdmin = userRole === 'admin';
    const isVendor = userRole === 'vendor';
    const storeApproved = user?.publicMetadata?.storeApproved;

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
                        <OptimizedImage
                            src={lang === 'ar' ? assets.logo_ar : assets.logo_en}
                            alt={dict?.navbar?.logoAlt || "Al Wathba Coop Logo"}
                            width={150}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href={getLocalizedPath('/')}>{dict.navigation.home}</Link>
                        <Link href={getLocalizedPath('/shop')}>{dict.navigation.shop}</Link>
                        <Link href={getLocalizedPath('/about')}>{dict.navigation.about}</Link>
                        <Link href={getLocalizedPath('/')}>{dict.navigation.contact}</Link>

                        <form onSubmit={handleSearch} className="hidden lg:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
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

                        {isLoaded && (
                            <>
                                {isSignedIn ? (
                                    <div className="flex items-center gap-4">
                                        {/* Admin Dashboard Link */}
                                        {isAdmin && (
                                            <Link href={`/${lang}/admin`} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                                <Shield size={16} />
                                                <span className="hidden lg:inline">Admin</span>
                                            </Link>
                                        )}

                                        {/* Vendor Dashboard Link */}
                                        {isVendor && storeApproved && (
                                            <Link href="/store" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                                <StoreIcon size={16} />
                                                <span className="hidden lg:inline">My Store</span>
                                            </Link>
                                        )}

                                        {/* User Account Button */}
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    avatarBox: "h-9 w-9",
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <SignInButton mode="modal">
                                        <button className="px-8 py-2 bg-[#1D77B6] hover:bg-[#1a6aa3] transition text-white rounded-full">
                                            {dict.navigation.login}
                                        </button>
                                    </SignInButton>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu  */}
                    <div className="sm:hidden flex items-center gap-1">
                        <Link href={getLocalizedPath('/cart')} className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher currentLocale={lang} />

                        {isLoaded && (
                            <>
                                {isSignedIn ? (
                                    <div className="flex items-center gap-2 ml-2">
                                        {isAdmin && (
                                            <Link href={`/${lang}/admin`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <Shield size={18} />
                                            </Link>
                                        )}
                                        {isVendor && storeApproved && (
                                            <Link href="/store" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <StoreIcon size={18} />
                                            </Link>
                                        )}
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    avatarBox: "h-8 w-8",
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <SignInButton mode="modal">
                                        <button className="ml-2 px-7 py-1.5 bg-[#1D77B6] hover:bg-[#1a6aa3] text-sm transition text-white rounded-full">
                                            {dict.navigation.login}
                                        </button>
                                    </SignInButton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default NavbarWithTranslations