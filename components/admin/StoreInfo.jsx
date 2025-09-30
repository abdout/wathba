'use client'
import Image from "next/image"
import { MapPin, Mail, Phone, Calendar, User } from "lucide-react"
import OptimizedImage from "../OptimizedImage"

const StoreInfo = ({ store, dict, lang }) => {
    const isRTL = lang === 'ar'

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return dict?.admin?.storesPage?.approved || 'Approved'
            case 'pending':
                return dict?.admin?.storesPage?.pending || 'Pending'
            case 'rejected':
                return dict?.admin?.storesPage?.rejected || 'Rejected'
            default:
                return status
        }
    }

    return (
        <div className={`flex-1 space-y-3 text-sm ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-4 items-start`}>
                <OptimizedImage
                    width={80}
                    height={80}
                    src={store.logo}
                    alt={store.name}
                    className="w-20 h-20 object-contain shadow-md rounded-full"
                />
                <div className="flex-1 space-y-2">
                    <div className={`flex flex-col sm:flex-row gap-2 sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <h3 className={`text-xl font-semibold text-slate-800 ${isRTL ? 'font-arabic' : ''}`}>
                            {store.name}
                        </h3>
                        <span className="text-sm text-slate-500">@{store.username}</span>

                        {/* Status Badge */}
                        {store.status && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                store.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : store.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                            } ${isRTL ? 'font-arabic' : ''}`}>
                                {getStatusText(store.status)}
                            </span>
                        )}
                    </div>

                    <p className={`text-slate-600 mt-2 max-w-2xl ${isRTL ? 'font-arabic' : ''}`}>
                        {store.description}
                    </p>
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <p className={`flex items-center gap-2 text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin size={16} className="text-slate-400" />
                    <span className={isRTL ? 'font-arabic' : ''}>{store.address}</span>
                </p>
                <p className={`flex items-center gap-2 text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone size={16} className="text-slate-400" />
                    <span>{store.contact}</span>
                </p>
                <p className={`flex items-center gap-2 text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail size={16} className="text-slate-400" />
                    <span>{store.email}</span>
                </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
                <p className={`flex items-center gap-2 text-slate-500 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar size={14} />
                    <span className={isRTL ? 'font-arabic' : ''}>
                        {dict?.admin?.storesPage?.createdAt || 'Applied on'}: {' '}
                        {new Date(store.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                </p>

                {store.user && (
                    <div className={`flex items-center gap-3 text-sm mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <OptimizedImage
                            width={36}
                            height={36}
                            src={store.user.image}
                            alt={store.user.name}
                            className="w-9 h-9 rounded-full"
                        />
                        <div className={isRTL ? 'text-right' : ''}>
                            <p className={`text-slate-700 font-medium ${isRTL ? 'font-arabic' : ''}`}>
                                {store.user.name}
                            </p>
                            <p className="text-slate-400 text-xs">{store.user.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StoreInfo