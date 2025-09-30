'use client'
import { storesDummyData } from "@/assets/assets"
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStoresClient({ dict, lang }) {
    const isRTL = lang === 'ar'
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const fetchStores = async () => {
        setStores(storesDummyData)
        setLoading(false)
    }

    const toggleIsActive = async (storeId) => {
        // Logic to toggle the status of a store
        const updatedStores = stores.map(store =>
            store.id === storeId ? { ...store, isActive: !store.isActive } : store
        )
        setStores(updatedStores)
    }

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             store.owner?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' ||
                            (filterStatus === 'active' && store.isActive) ||
                            (filterStatus === 'inactive' && !store.isActive)
        return matchesSearch && matchesStatus
    })

    useEffect(() => {
        fetchStores()
    }, [])

    return !loading ? (
        <div className={`text-slate-500 mb-28 ${isRTL ? 'text-right' : ''}`}>
            <h1 className={`text-3xl font-semibold mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                {dict?.admin?.storesPage?.title || 'Manage Stores'}
            </h1>

            {/* Search and Filter Bar */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <input
                    type="text"
                    placeholder={dict?.admin?.storesPage?.searchPlaceholder || "Search stores..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 ${isRTL ? 'text-right font-arabic' : ''}`}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 ${isRTL ? 'text-right font-arabic' : ''}`}
                >
                    <option value="all">{dict?.admin?.storesPage?.allStores || "All Stores"}</option>
                    <option value="active">{dict?.admin?.storesPage?.approved || "Active"}</option>
                    <option value="inactive">{dict?.admin?.storesPage?.rejected || "Inactive"}</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8`}>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {dict?.admin?.totalStores || "Total Stores"}
                    </p>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">{stores.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {dict?.admin?.storesPage?.approved || "Active Stores"}
                    </p>
                    <p className="text-2xl font-semibold text-green-600 mt-1">
                        {stores.filter(s => s.isActive).length}
                    </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className={`text-sm text-slate-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {dict?.admin?.storesPage?.rejected || "Inactive Stores"}
                    </p>
                    <p className="text-2xl font-semibold text-red-600 mt-1">
                        {stores.filter(s => !s.isActive).length}
                    </p>
                </div>
            </div>

            {filteredStores.length ? (
                <div className="flex flex-col gap-4">
                    {filteredStores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} max-md:flex-col gap-4 md:items-center justify-between`}>
                                {/* Store Info */}
                                <div className="flex-1">
                                    <StoreInfo store={store} dict={dict} lang={lang} />
                                </div>

                                {/* Actions */}
                                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className={`text-sm font-medium ${isRTL ? 'font-arabic' : ''}`}>
                                        {dict?.admin?.storesPage?.status || "Status"}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            onChange={() => {
                                                const action = store.isActive ?
                                                    dict?.admin?.rejecting || "Deactivating" :
                                                    dict?.admin?.approving || "Activating"
                                                toast.promise(
                                                    toggleIsActive(store.id),
                                                    {
                                                        loading: `${action}...`,
                                                        success: dict?.admin?.storesPage?.statusUpdated || "Status updated",
                                                        error: dict?.admin?.storesPage?.statusUpdateFailed || "Failed to update status"
                                                    }
                                                )
                                            }}
                                            checked={store.isActive}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                    </label>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    } ${isRTL ? 'font-arabic' : ''}`}>
                                        {store.isActive ?
                                            (dict?.admin?.storesPage?.approved || "Active") :
                                            (dict?.admin?.storesPage?.rejected || "Inactive")
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80 bg-white border border-slate-200 rounded-lg">
                    <h1 className={`text-2xl text-slate-400 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                        {searchTerm || filterStatus !== 'all' ?
                            (dict?.admin?.storesPage?.noStoresFound || "No stores found matching your criteria") :
                            (dict?.admin?.storesPage?.noStores || "No stores available")
                        }
                    </h1>
                </div>
            )}
        </div>
    ) : <Loading />
}