'use client'
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ClockIcon, TruckIcon, PackageIcon, CreditCardIcon, BanknoteIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import CurrencyIcon from './CurrencyIcon';
import OptimizedImage from './OptimizedImage';

const OrderDetailsPage = ({ orderId, dict, lang }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentStatus = searchParams.get('payment');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        // Show payment status messages
        if (paymentStatus === 'success') {
            toast.success(dict?.orders?.paymentSuccess || 'Payment successful! Thank you for your order.');
        } else if (paymentStatus === 'cancelled') {
            toast.error(dict?.orders?.paymentCancelled || 'Payment was cancelled. Your order is still pending.');
        }
    }, [paymentStatus, dict]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
            } else {
                toast.error(dict?.orders?.fetchError || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error(dict?.orders?.fetchError || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <ClockIcon className="w-5 h-5" />;
            case 'PROCESSING':
                return <PackageIcon className="w-5 h-5" />;
            case 'SHIPPED':
                return <TruckIcon className="w-5 h-5" />;
            case 'DELIVERED':
                return <CheckCircleIcon className="w-5 h-5" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return 'text-blue-600 bg-blue-50';
            case 'PROCESSING':
                return 'text-yellow-600 bg-yellow-50';
            case 'SHIPPED':
                return 'text-purple-600 bg-purple-50';
            case 'DELIVERED':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getPaymentMethodIcon = (method) => {
        return method === 'STRIPE' || method === 'CARD' ?
            <CreditCardIcon className="w-5 h-5" /> :
            <BanknoteIcon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                        {dict?.orders?.notFound || "Order not found"}
                    </h1>
                    <button
                        onClick={() => router.push(`/${lang}/orders`)}
                        className="mt-4 px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                    >
                        {dict?.orders?.backToOrders || "Back to Orders"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Banner for new orders */}
                {paymentStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">
                                    {dict?.orders?.orderConfirmed || "Order Confirmed!"}
                                </h3>
                                <p className="text-green-700">
                                    {dict?.orders?.confirmationMessage || "Thank you for your order. We'll send you a confirmation email shortly."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Header */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                {dict?.orders?.orderDetails || "Order Details"}
                            </h1>
                            <p className="text-slate-500">
                                {dict?.orders?.orderId || "Order ID"}: <span className="font-mono">{order.id}</span>
                            </p>
                            <p className="text-slate-500">
                                {dict?.orders?.orderDate || "Order Date"}: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="font-medium">
                                {dict?.orders?.[order.status] || order.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span className="text-slate-600">
                                {order.paymentMethod === 'COD' ?
                                    dict?.payment?.cod || 'Cash on Delivery' :
                                    dict?.payment?.card || 'Card Payment'}
                            </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${
                            order.isPaid ?
                            'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {order.isPaid ?
                                dict?.payment?.paid || 'Paid' :
                                dict?.payment?.pending || 'Payment Pending'}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        {dict?.orders?.items || "Order Items"}
                    </h2>
                    <div className="space-y-4">
                        {order.orderItems?.map((item) => (
                            <div key={item.productId} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <OptimizedImage
                                        src={item.product?.images?.[0] || '/assets/logo.svg'}
                                        alt={item.product?.name || 'Product'}
                                        width={60}
                                        height={60}
                                        transformation={[{ width: 120, height: 120, quality: 85 }]}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-slate-900">
                                        {item.product?.name || 'Product'}
                                    </h3>
                                    <p className="text-slate-500">
                                        {dict?.orders?.quantity || "Quantity"}: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900 flex items-center gap-0.5">
                                        <CurrencyIcon className="w-4 h-4" width={16} height={16} />
                                        {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-slate-500 flex items-center gap-0.5">
                                        <CurrencyIcon className="w-3 h-3" width={12} height={12} />
                                        {item.price.toFixed(2)} {dict?.orders?.each || "each"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        {dict?.orders?.shippingAddress || "Shipping Address"}
                    </h2>
                    {order.address && (
                        <div className="text-slate-600">
                            <p className="font-medium">{order.address.name}</p>
                            <p>{order.address.street}</p>
                            <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                            <p>{order.address.country}</p>
                            <p>{dict?.orders?.phone || "Phone"}: {order.address.phone}</p>
                            <p>{dict?.orders?.email || "Email"}: {order.address.email}</p>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        {dict?.orders?.summary || "Order Summary"}
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>{dict?.orders?.subtotal || "Subtotal"}</span>
                            <span className="flex items-center gap-0.5">
                                <CurrencyIcon className="w-4 h-4" width={16} height={16} />
                                {order.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>{dict?.orders?.shipping || "Shipping"}</span>
                            <span>{dict?.orders?.free || "Free"}</span>
                        </div>
                        {order.isCouponUsed && order.coupon && (
                            <div className="flex justify-between text-green-600">
                                <span>{dict?.orders?.discount || "Discount"}</span>
                                <span>-{order.coupon.discount}%</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-semibold text-slate-900 pt-2 border-t">
                            <span>{dict?.orders?.total || "Total"}</span>
                            <span className="flex items-center gap-0.5">
                                <CurrencyIcon className="w-5 h-5" width={20} height={20} />
                                {order.total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => router.push(`/${lang}/orders`)}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                    >
                        {dict?.orders?.backToOrders || "Back to Orders"}
                    </button>
                    {!order.isPaid && order.paymentMethod === 'STRIPE' && (
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch('/api/stripe/checkout', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            orderId: order.id,
                                            returnUrl: window.location.href
                                        })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                        window.location.href = data.data.checkoutUrl;
                                    } else {
                                        toast.error(dict?.payment?.retryError || 'Failed to create payment session');
                                    }
                                } catch (error) {
                                    toast.error(dict?.payment?.retryError || 'Failed to create payment session');
                                }
                            }}
                            className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                        >
                            {dict?.payment?.completePayment || "Complete Payment"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;