'use client'
import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import CurrencyIcon from "@/components/CurrencyIcon"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard({ dict, lang }) {

    // Currency icon is now handled by CurrencyIcon component

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        {
            title: dict?.admin?.totalProducts || 'Total Products',
            value: dashboardData.products,
            icon: ShoppingBasketIcon
        },
        {
            title: dict?.admin?.totalRevenue || 'Total Revenue',
            value: dashboardData.revenue,
            icon: CircleDollarSignIcon,
            showCurrency: true
        },
        {
            title: dict?.admin?.totalOrders || 'Total Orders',
            value: dashboardData.orders,
            icon: TagsIcon
        },
        {
            title: dict?.admin?.totalStores || 'Total Stores',
            value: dashboardData.stores,
            icon: StoreIcon
        },
    ]

    const fetchDashboardData = async () => {
        setDashboardData(dummyAdminDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className={`text-2xl ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>
                {dict?.admin?.admin || 'Admin'} <span className="text-slate-800 font-medium">{dict?.admin?.dashboard || 'Dashboard'}</span>
            </h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className={`flex flex-col gap-3 text-xs ${lang === 'ar' ? 'text-right font-arabic' : ''}`}>
                                <p>{card.title}</p>
                                <b className={`text-2xl font-medium text-slate-700 flex items-center gap-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    {card.showCurrency && <CurrencyIcon className="w-5 h-5" width={20} height={20} />}
                                    {card.value}
                                </b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}