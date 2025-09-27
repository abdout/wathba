'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import LanguageSwitcher from "./LanguageSwitcher";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/">
                        <Image
                            src={assets.logo_en}
                            alt="GoCart Logo"
                            height={40}
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/about">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher />

                        <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                            Login
                        </button>

                    </div>

                    {/* Mobile Menu  */}
                    <div className="sm:hidden flex items-center gap-1">
                        <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-lg">
                            <ShoppingCart size={18} />
                            <span className="absolute -top-1 -right-0 text-[10px] text-white bg-slate-600 min-w-[16px] h-[16px] flex items-center justify-center rounded-full">{cartCount}</span>
                        </Link>

                        <LanguageSwitcher />

                        <button className="ml-2 px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                            Login
                        </button>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar