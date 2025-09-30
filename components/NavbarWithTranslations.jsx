'use client'
import { Search, ShoppingCart, User, Store as StoreIcon, Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocale } from "@/components/internationalization/use-locale";
import { assets } from "@/assets/assets";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import OptimizedImage from "./OptimizedImage"; // Using simplified version

const NavbarWithTranslations = ({ dict, lang }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isRTL } = useLocale();
    const { user, isLoaded, isSignedIn } = useUser();

    const [search, setSearch] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showSearchDialog, setShowSearchDialog] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const cartCount = useSelector(state => state?.cart?.total || 0)
    const products = useSelector(state => state?.product?.list || [])
    const mobileMenuRef = useRef(null)
    const searchDialogRef = useRef(null)

    const userRole = user?.publicMetadata?.role;
    const isAdmin = userRole === 'admin';
    const isVendor = userRole === 'vendor';
    const storeApproved = user?.publicMetadata?.storeApproved;

    // Close mobile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false)
            }
            if (showSearchDialog && searchDialogRef.current && !searchDialogRef.current.contains(event.target)) {
                setShowSearchDialog(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [mobileMenuOpen, showSearchDialog])

    // Real-time search filtering
    useEffect(() => {
        if (search.trim() && showSearchDialog) {
            setSearchLoading(true)
            const filtered = products.filter(product =>
                product.name?.toLowerCase().includes(search.toLowerCase()) ||
                product.category?.toLowerCase().includes(search.toLowerCase()) ||
                product.description?.toLowerCase().includes(search.toLowerCase())
            )
            setSearchResults(filtered)
            setSearchLoading(false)
        } else {
            setSearchResults([])
        }
    }, [search, products, showSearchDialog])

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            setShowSearchDialog(false)
            router.push(`/${lang}/shop?search=${search}`)
            setSearch('')
        }
    }

    const handleSearchIconClick = () => {
        setShowSearchDialog(true)
    }

    const handleProductClick = (productId) => {
        setShowSearchDialog(false)
        setSearch('')
        router.push(`/${lang}/product/${productId}`)
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

                    {/* Left Side: Logo */}
                    <div className="flex items-center gap-4">
                        <Link href={getLocalizedPath('/')}>
                            {/* Desktop: Language-specific logos */}
                            <OptimizedImage
                                src={lang === 'ar' ? assets.logo_ar : assets.logo_en}
                                alt={dict?.navbar?.logoAlt || "Alwathba Coop Logo"}
                                width={120}
                                height={32}
                                className="h-8 w-auto hidden sm:block"
                                priority
                            />
                            {/* Mobile: Generic logo */}
                            <OptimizedImage
                                src="/assets/logo.svg"
                                alt={dict?.navbar?.logoAlt || "Alwathba Coop Logo"}
                                width={80}
                                height={24}
                                className="h-6 w-auto sm:hidden"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Center/Right Side: Navigation Links + Actions */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                        {/* Desktop Navigation Links */}
                        <div className="flex items-center gap-4 lg:gap-6 text-slate-600">
                            <Link href={getLocalizedPath('/about')}>{dict.navigation.about || 'About'}</Link>
                            <Link href={getLocalizedPath('/shop')}>{dict.navigation.shop || 'Shop'}</Link>

                            {/* Seller Link - Always visible */}
                            <Link href={getLocalizedPath('/create-store')}>
                                {dict.navigation.seller || 'Seller'}
                            </Link>

                            {/* Admin Link - Always visible */}
                            <Link href={`/${lang}/admin`}>
                                {dict.navigation.admin || 'Admin'}
                            </Link>
                        </div>

                        {/* Search - Icon only on LG, full input on XL+ */}
                        <button
                            onClick={handleSearchIconClick}
                            className="lg:flex xl:hidden items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg"
                        >
                            <Search size={18} />
                        </button>

                        {/* XL+: Full search input */}
                        <button
                            onClick={handleSearchIconClick}
                            className="hidden xl:flex items-center w-48 text-sm gap-2 bg-slate-100 px-3 py-2 rounded-full hover:bg-slate-200 transition-colors"
                        >
                            <Search size={16} className="text-slate-600" />
                            <span className="text-slate-600">{dict.navigation.searchPlaceholder || 'Search'}</span>
                        </button>

                        <Link href={getLocalizedPath('/cart')} className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher currentLocale={lang} />

                        {isLoaded && (
                            <>
                                {isSignedIn ? (
                                    <div className="flex items-center gap-4">
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

                    {/* Mobile Menu Button & Actions */}
                    <div className="sm:hidden flex items-center gap-1">
                        <Link href={getLocalizedPath('/cart')} className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher currentLocale={lang} />

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="ml-2 flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div
                        ref={mobileMenuRef}
                        className="sm:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-50"
                    >
                        <div className="flex flex-col p-4 gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full">
                                <Search size={16} className="text-slate-600" />
                                <input
                                    className="w-full bg-transparent outline-none placeholder-slate-600 text-sm"
                                    type="text"
                                    placeholder={dict.navigation.searchPlaceholder || 'Search'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    required
                                />
                            </form>

                            {/* Navigation Links */}
                            <div className="flex flex-col gap-3 text-slate-600 pt-4">
                                <Link
                                    href={getLocalizedPath('/about')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 hover:text-slate-800"
                                >
                                    {dict.navigation.about || 'About'}
                                </Link>
                                <Link
                                    href={getLocalizedPath('/shop')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 hover:text-slate-800"
                                >
                                    {dict.navigation.shop || 'Shop'}
                                </Link>
                                <Link
                                    href={getLocalizedPath('/create-store')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 hover:text-slate-800"
                                >
                                    {dict.navigation.seller || 'Seller'}
                                </Link>
                                <Link
                                    href={`/${lang}/admin`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-2 hover:text-slate-800"
                                >
                                    {dict.navigation.admin || 'Admin'}
                                </Link>
                            </div>

                            {/* User Actions */}
                            {isLoaded && (
                                <div className="pt-4">
                                    {isSignedIn ? (
                                        <div className="flex items-center gap-3">
                                            <UserButton
                                                afterSignOutUrl="/"
                                                appearance={{
                                                    elements: {
                                                        avatarBox: "h-10 w-10",
                                                    },
                                                }}
                                            />
                                            <span className="text-sm text-slate-600">{user?.firstName || 'Account'}</span>
                                        </div>
                                    ) : (
                                        <SignInButton mode="modal">
                                            <button className="w-full py-2.5 bg-[#1D77B6] hover:bg-[#1a6aa3] transition text-white rounded-full">
                                                {dict.navigation.login}
                                            </button>
                                        </SignInButton>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <hr className="border-gray-300" />

            {/* Search Dialog - Full Screen Overlay */}
            {showSearchDialog && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20">
                    <div
                        ref={searchDialogRef}
                        className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
                    >
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="p-4 border-b">
                            <div className="flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-lg">
                                <Search size={20} className="text-slate-600" />
                                <input
                                    className="w-full bg-transparent outline-none text-lg"
                                    type="text"
                                    placeholder={dict?.navigation?.searchPlaceholder || 'Search products...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Search Results */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {searchLoading ? (
                                <div className="p-8 text-center text-slate-500">
                                    {dict?.general?.loading || 'Loading...'}
                                </div>
                            ) : search.trim() ? (
                                searchResults.length > 0 ? (
                                    <div className="p-2">
                                        {searchResults.slice(0, 8).map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                            >
                                                <OptimizedImage
                                                    src={product.images?.[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    width={60}
                                                    height={60}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-slate-800">{product.name}</h3>
                                                    <p className="text-sm text-slate-500">{product.category}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {product.mrp && product.mrp > product.price && (
                                                            <span className="text-xs text-slate-400 line-through">
                                                                {product.mrp} {dict?.general?.currency || 'AED'}
                                                            </span>
                                                        )}
                                                        <span className="text-sm font-semibold text-[#1D77B6]">
                                                            {product.price} {dict?.general?.currency || 'AED'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                        {searchResults.length > 8 && (
                                            <button
                                                onClick={handleSearch}
                                                className="w-full p-3 text-center text-[#1D77B6] hover:bg-slate-50 rounded-lg mt-2"
                                            >
                                                {dict?.shop?.viewAllResults || 'View all results'} ({searchResults.length})
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        {dict?.shop?.noProductsFound || 'No products found'}
                                    </div>
                                )
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    {dict?.shop?.startTyping || 'Start typing to search products...'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavbarWithTranslations