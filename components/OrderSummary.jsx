import { PlusIcon, SquarePenIcon, XIcon, Trash2Icon, StarIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CurrencyIcon from './CurrencyIcon';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { fetchAddresses, selectAddress, deleteAddress, setDefaultAddress } from '@/lib/features/address/addressSlice';

const OrderSummary = ({ totalPrice, items, dict }) => {


    const router = useRouter();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state?.address?.list || []);
    const selectedAddressId = useSelector(state => state?.address?.selectedAddressId);
    const addressLoading = useSelector(state => state?.address?.loading);
    const user = useSelector(state => state?.auth?.user);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Get the selected address object
    const selectedAddress = addressList.find(addr => addr.id === selectedAddressId);

    // Fetch addresses when component mounts
    useEffect(() => {
        if (user && addressList.length === 0) {
            dispatch(fetchAddresses());
        }
    }, [dispatch, user]);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        // TODO: Implement coupon validation
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Check if user is logged in
        if (!user) {
            toast.error(dict?.auth?.loginRequired || 'Please sign in to place an order');
            router.push('/sign-in');
            return;
        }

        // Validate address selection
        if (!selectedAddress) {
            toast.error(dict?.cart?.selectAddressError || 'Please select a delivery address');
            return;
        }

        // Validate cart items
        if (!items || items.length === 0) {
            toast.error(dict?.cart?.emptyCartError || 'Your cart is empty');
            return;
        }

        setIsPlacingOrder(true);

        try {
            // Prepare order data
            const orderData = {
                addressId: selectedAddress.id,
                paymentMethod,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // Add coupon if applied
            if (coupon && coupon.code) {
                orderData.couponCode = coupon.code;
            }

            // Create order via API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || dict?.cart?.orderError || 'Failed to place order');
            }

            // If payment method is Stripe, redirect to Stripe checkout
            if (paymentMethod === 'STRIPE') {
                // Create Stripe checkout session
                const stripeResponse = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: data.order.id,
                        returnUrl: `${window.location.origin}/orders/${data.order.id}`
                    })
                });

                const stripeData = await stripeResponse.json();

                if (!stripeResponse.ok || !stripeData.success) {
                    throw new Error(stripeData.error || 'Failed to create payment session');
                }

                // Clear cart before redirecting
                dispatch(clearCart());

                // Redirect to Stripe Checkout
                window.location.href = stripeData.data.checkoutUrl;
                return;
            }

            // For COD, clear cart and redirect to orders
            dispatch(clearCart());

            // Show success message
            toast.success(dict?.cart?.orderSuccess || 'Order placed successfully!');

            // Redirect to orders page
            router.push('/orders');
        } catch (error) {
            console.error('Failed to place order:', error);
            toast.error(error.message || dict?.cart?.orderError || 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>{dict?.cart?.paymentSummary || "Payment Summary"}</h2>
            <p className='text-slate-400 text-xs my-4'>{dict?.cart?.paymentMethod || "Payment Method"}</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>{"COD"}</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>{"Stripe Payment"}</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>{dict?.cart?.address || "Address"}</p>
                {
                    selectedAddress ? (
                        <div className='mt-2'>
                            <div className='flex gap-2 items-center justify-between p-3 bg-white rounded-lg border border-slate-200'>
                                <div className='flex-1'>
                                    <p className='font-medium text-slate-700'>{selectedAddress.name}</p>
                                    <p className='text-xs mt-0.5'>{selectedAddress.street}</p>
                                    <p className='text-xs'>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
                                    <p className='text-xs'>{selectedAddress.phone}</p>
                                    {selectedAddress.isDefault && (
                                        <span className='inline-flex items-center gap-0.5 text-xs text-amber-600 mt-1'>
                                            <StarIcon size={10} fill="currentColor" />
                                            Default
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => dispatch(selectAddress(null))} className='text-slate-400 hover:text-slate-600'>
                                    <SquarePenIcon size={16} />
                                </button>
                            </div>
                            <button className='flex items-center gap-1 text-slate-600 mt-2 text-sm' onClick={() => dispatch(selectAddress(null))}>
                                {dict?.cart?.changeAddress || "Change Address"}
                            </button>
                        </div>
                    ) : (
                        <div>
                            {addressLoading ? (
                                <div className='py-3 text-center text-slate-400'>
                                    Loading addresses...
                                </div>
                            ) : addressList.length > 0 ? (
                                <div className='space-y-2 my-3'>
                                    {addressList.map((address) => (
                                        <div key={address.id} className='flex gap-2 items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer'
                                             onClick={() => dispatch(selectAddress(address.id))}>
                                            <input
                                                type="radio"
                                                checked={selectedAddressId === address.id}
                                                onChange={() => dispatch(selectAddress(address.id))}
                                                className='accent-gray-500'
                                            />
                                            <div className='flex-1'>
                                                <p className='font-medium text-slate-700 text-sm'>{address.name}</p>
                                                <p className='text-xs text-slate-500'>{address.street}</p>
                                                <p className='text-xs text-slate-500'>{address.city}, {address.state} {address.zip}</p>
                                                {address.isDefault && (
                                                    <span className='inline-flex items-center gap-0.5 text-xs text-amber-600 mt-0.5'>
                                                        <StarIcon size={10} fill="currentColor" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex gap-1'>
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dispatch(setDefaultAddress(address.id));
                                                        }}
                                                        className='text-amber-500 hover:text-amber-600 p-1'
                                                        title="Set as default"
                                                    >
                                                        <StarIcon size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this address?')) {
                                                            dispatch(deleteAddress(address.id));
                                                        }
                                                    }}
                                                    className='text-red-500 hover:text-red-600 p-1'
                                                    title="Delete address"
                                                >
                                                    <Trash2Icon size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            <button type="button" className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)}>
                                {dict?.cart?.addAddress || "Add Address"} <PlusIcon size={18} />
                            </button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>{dict?.cart?.subtotal || "Subtotal"}:</p>
                        <p>{dict?.cart?.shipping || "Shipping"}:</p>
                        {coupon && <p>{dict?.forms?.couponCode || "Coupon"}:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p className='flex items-center gap-0.5 justify-end'><CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />{totalPrice.toLocaleString()}</p>
                        <p>{dict?.cart?.free || "Free"}</p>
                        {coupon && <p className='flex items-center gap-0.5 justify-end'>-<CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />{(coupon.discount / 100 * totalPrice).toFixed(2)}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder={dict?.forms?.couponCode || 'Coupon Code'} className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>{dict?.forms?.apply || "Apply"}</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>{dict?.cart?.total || "Total"}:</p>
                <p className='font-medium text-right flex items-center gap-0.5 justify-end'><CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>
            <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`w-full py-2.5 rounded transition-all ${
                    isPlacingOrder
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-900 active:scale-95'
                }`}
            >
                {isPlacingOrder
                    ? (dict?.cart?.placingOrder || "Placing Order...")
                    : (dict?.cart?.placeOrder || "Place Order")
                }
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} dict={dict} />}

        </div>
    )
}

export default OrderSummary