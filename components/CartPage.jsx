'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import CurrencyIcon from "@/components/CurrencyIcon";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CartPage({ dict, lang }) {
    const { cartItems } = useSelector(state => state?.cart || { cartItems: {} });
    const products = useSelector(state => state?.product?.list || []);
    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        setTotalPrice(0);
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                cartArray.push({
                    ...product,
                    quantity: value,
                });
                setTotalPrice(prev => prev + product.price * value);
            }
        }
        setCartArray(cartArray);
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    // Get translated product name
    const getProductName = (product) => {
        return dict?.productNames?.[product.name] || product.name;
    };

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <PageTitle
                    heading={dict?.cart?.myCart || "My Cart"}
                    text={dict?.cart?.itemsInCart || "items in your cart"}
                    linkText={dict?.cart?.addMore || "Add more"}
                    lang={lang}
                />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">
                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">{dict?.cart?.product || "Product"}</th>
                                <th>{dict?.product?.quantity || "Quantity"}</th>
                                <th>{dict?.cart?.totalPrice || "Total Price"}</th>
                                <th className="max-md:hidden">{dict?.general?.remove || "Remove"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartArray.map((item, index) => (
                                <tr key={index} className="space-x-2">
                                    <td className="flex gap-3 my-4">
                                        <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                            <OptimizedImage
                                                src={item.images[0]}
                                                className="h-14 w-auto"
                                                alt={getProductName(item)}
                                                width={45}
                                                height={45}
                                                transformation={[
                                                    { width: 90, height: 90, quality: 80 }
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <p className="max-sm:text-sm">{getProductName(item)}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                            <p className="flex items-center gap-0.5">
                                                <CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />
                                                {item.price}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Counter productId={item.id} />
                                    </td>
                                    <td className="text-center flex items-center justify-center gap-0.5">
                                        <CurrencyIcon className="w-3.5 h-3.5" width={14} height={14} />
                                        {(item.price * item.quantity).toLocaleString()}
                                    </td>
                                    <td className="text-center max-md:hidden">
                                        <button
                                            onClick={() => handleDeleteItemFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                                        >
                                            <Trash2Icon size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} dict={dict} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">
                {dict?.cart?.emptyCart || "Your cart is empty"}
            </h1>
        </div>
    );
}