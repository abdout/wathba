'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon, TagIcon, CalendarIcon, PercentIcon } from "lucide-react"
import { couponDummyData } from "@/assets/assets"

export default function AdminCouponsClient({ dict, lang }) {
    const isRTL = lang === 'ar'
    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date()
    })

    const fetchCoupons = async () => {
        setCoupons(couponDummyData)
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        // Logic to add a coupon
        const newCouponData = { ...newCoupon, id: Date.now() }
        setCoupons([...coupons, newCouponData])
        setNewCoupon({
            code: '',
            description: '',
            discount: '',
            forNewUser: false,
            forMember: false,
            isPublic: false,
            expiresAt: new Date()
        })
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        // Logic to delete a coupon
        setCoupons(coupons.filter(c => c.code !== code))
    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className={`text-slate-500 mb-40 ${isRTL ? 'text-right' : ''}`}>

            {/* Page Header */}
            <h1 className={`text-3xl font-semibold mb-8 text-slate-800 ${isRTL ? 'font-arabic' : ''}`}>
                {dict?.admin?.sidebar?.coupons || 'Coupons Management'}
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.activeCoupons || "Active Coupons"}
                            </p>
                            <p className="text-2xl font-semibold text-slate-800 mt-1">
                                {coupons.filter(c => new Date(c.expiresAt) > new Date()).length}
                            </p>
                        </div>
                        <TagIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.expired || "Expired"}
                            </p>
                            <p className="text-2xl font-semibold text-slate-800 mt-1">
                                {coupons.filter(c => new Date(c.expiresAt) <= new Date()).length}
                            </p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.newUser || "New User"}
                            </p>
                            <p className="text-2xl font-semibold text-slate-800 mt-1">
                                {coupons.filter(c => c.forNewUser).length}
                            </p>
                        </div>
                        <TagIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                            <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.members || "Members"}
                            </p>
                            <p className="text-2xl font-semibold text-slate-800 mt-1">
                                {coupons.filter(c => c.forMember).length}
                            </p>
                        </div>
                        <PercentIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Add Coupon Form */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
                <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                    {dict?.admin?.couponsPage?.addCoupon || 'Add New Coupon'}
                </h2>
                <form onSubmit={(e) => toast.promise(handleAddCoupon(e), {
                    loading: dict?.admin?.couponsPage?.addingCoupon || "Adding coupon...",
                    success: dict?.admin?.couponsPage?.couponAdded || "Coupon added successfully",
                    error: dict?.admin?.couponsPage?.couponAddError || "Failed to add coupon"
                })} className="text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-slate-600 mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.couponCode || 'Coupon Code'}
                            </label>
                            <input
                                type="text"
                                placeholder={dict?.admin?.couponsPage?.enterCode || "Enter code"}
                                className={`w-full p-2.5 border border-slate-200 outline-slate-400 rounded-lg ${isRTL ? 'text-right font-arabic' : ''}`}
                                name="code"
                                value={newCoupon.code}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className={`block text-slate-600 mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.discount || 'Discount (%)'}
                            </label>
                            <input
                                type="number"
                                placeholder={dict?.admin?.couponsPage?.enterDiscount || "Enter discount"}
                                min={1}
                                max={100}
                                className={`w-full p-2.5 border border-slate-200 outline-slate-400 rounded-lg ${isRTL ? 'text-right' : ''}`}
                                name="discount"
                                value={newCoupon.discount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className={`block text-slate-600 mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                            {dict?.admin?.couponsPage?.description || 'Description'}
                        </label>
                        <input
                            type="text"
                            placeholder={dict?.admin?.couponsPage?.enterDescription || "Enter description"}
                            className={`w-full p-2.5 border border-slate-200 outline-slate-400 rounded-lg ${isRTL ? 'text-right font-arabic' : ''}`}
                            name="description"
                            value={newCoupon.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mt-4">
                        <label className={`block text-slate-600 mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                            {dict?.admin?.couponsPage?.expiryDate || 'Expiry Date'}
                        </label>
                        <input
                            type="date"
                            className={`w-full p-2.5 border border-slate-200 outline-slate-400 rounded-lg ${isRTL ? 'text-right' : ''}`}
                            name="expiresAt"
                            value={format(newCoupon.expiresAt, 'yyyy-MM-dd')}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    name="forNewUser"
                                    checked={newCoupon.forNewUser}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                            </label>
                            <p className={isRTL ? 'font-arabic' : ''}>
                                {dict?.admin?.couponsPage?.forNewUsers || 'For New Users'}
                            </p>
                        </div>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    name="forMember"
                                    checked={newCoupon.forMember}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                            </label>
                            <p className={isRTL ? 'font-arabic' : ''}>
                                {dict?.admin?.couponsPage?.forMembers || 'For Members'}
                            </p>
                        </div>
                    </div>

                    <button className="mt-6 px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-95 transition">
                        {dict?.admin?.couponsPage?.addCoupon || 'Add Coupon'}
                    </button>
                </form>
            </div>

            {/* List Coupons */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className={`text-xl font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                        {dict?.admin?.couponsPage?.couponsList || 'Coupons List'}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className={`min-w-full text-sm ${isRTL ? 'text-right' : ''}`}>
                        <thead className="bg-slate-50">
                            <tr>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.code || 'Code'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.description || 'Description'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.discount || 'Discount'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.expiresAt || 'Expires At'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.newUser || 'New User'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.couponsPage?.member || 'Member'}
                                </th>
                                <th className={`py-3 px-4 font-semibold text-slate-600 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                    {dict?.admin?.storesPage?.actions || 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => {
                                const isExpired = new Date(coupon.expiresAt) <= new Date()
                                return (
                                    <tr key={coupon.code} className={`hover:bg-slate-50 ${isExpired ? 'opacity-50' : ''}`}>
                                        <td className="py-3 px-4 font-medium text-slate-800">
                                            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 text-slate-800 ${isRTL ? 'font-arabic' : ''}`}>
                                            {coupon.description}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-semibold text-green-600">{coupon.discount}%</span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-800">
                                            {format(coupon.expiresAt, lang === 'ar' ? 'yyyy/MM/dd' : 'yyyy-MM-dd')}
                                            {isExpired && (
                                                <span className={`ml-2 text-xs text-red-500 ${isRTL ? 'font-arabic' : ''}`}>
                                                    ({dict?.admin?.couponsPage?.expired || 'Expired'})
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                coupon.forNewUser ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                            } ${isRTL ? 'font-arabic' : ''}`}>
                                                {coupon.forNewUser ?
                                                    (dict?.admin?.couponsPage?.yes || 'Yes') :
                                                    (dict?.admin?.couponsPage?.no || 'No')
                                                }
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                coupon.forMember ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                                            } ${isRTL ? 'font-arabic' : ''}`}>
                                                {coupon.forMember ?
                                                    (dict?.admin?.couponsPage?.yes || 'Yes') :
                                                    (dict?.admin?.couponsPage?.no || 'No')
                                                }
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => toast.promise(deleteCoupon(coupon.code), {
                                                    loading: dict?.admin?.couponsPage?.deletingCoupon || "Deleting coupon...",
                                                    success: dict?.admin?.couponsPage?.couponDeleted || "Coupon deleted",
                                                    error: dict?.admin?.couponsPage?.deleteError || "Failed to delete"
                                                })}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <DeleteIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <div className="py-12 text-center">
                            <p className={`text-slate-400 ${isRTL ? 'font-arabic' : ''}`}>
                                {dict?.admin?.couponsPage?.noCoupons || 'No coupons available'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}