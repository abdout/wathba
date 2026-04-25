'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from 'react-redux'
import { addAddress } from '@/lib/features/address/addressSlice'

const AddressModal = ({ setShowAddressModal, dict }) => {

    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(address),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save address');
            }

            // Add to Redux store
            dispatch(addAddress(data.data));

            toast.success(dict?.address?.saved || 'Address saved successfully');
            setShowAddressModal(false);
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.message || dict?.address?.saveError || 'Failed to save address');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
                <h2 className="text-3xl ">{dict?.address?.addNewLabel || 'Add New'} <span className="font-semibold">{dict?.address?.addressLabel || 'Address'}</span></h2>
                <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.namePlaceholder || 'Enter your name'} required />
                <input name="email" onChange={handleAddressChange} value={address.email} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="email" placeholder={dict?.address?.emailPlaceholder || 'Email address'} required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.streetPlaceholder || 'Street'} required />
                <div className="flex gap-4">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.cityPlaceholder || 'City'} required />
                    <input name="state" onChange={handleAddressChange} value={address.state} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.statePlaceholder || 'State'} required />
                </div>
                <div className="flex gap-4">
                    <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="number" placeholder={dict?.address?.zipPlaceholder || 'Zip code'} required />
                    <input name="country" onChange={handleAddressChange} value={address.country} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.countryPlaceholder || 'Country'} required />
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder={dict?.address?.phonePlaceholder || 'Phone'} required />
                <button
                    disabled={isSubmitting}
                    className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (dict?.address?.saving || 'SAVING...') : (dict?.address?.saveButton || 'SAVE ADDRESS')}
                </button>
            </div>
            <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
        </form>
    )
}

export default AddressModal