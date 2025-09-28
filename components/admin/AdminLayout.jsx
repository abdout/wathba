'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = ({ children, dict, lang }) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchIsAdmin = async () => {
        setIsAdmin(true)
        setLoading(false)
    }

    useEffect(() => {
        fetchIsAdmin()
    }, [])

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar dict={dict} lang={lang} />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar dict={dict} lang={lang} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className={`text-2xl sm:text-4xl font-semibold text-slate-400 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {dict?.admin?.notAuthorized || 'You are not authorized to access this page'}
            </h1>
            <Link href={`/${lang}`} className={`bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                {dict?.admin?.goToHome || 'Go to home'} <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default AdminLayout