'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import CurrencyIcon from "./CurrencyIcon";
import OptimizedImage from "./OptimizedImage";

const ProductDetails = ({ product, dict, lang }) => {

    // Early return if product is not available
    if (!product) {
        return null;
    }

    const productId = product.id;

    const cart = useSelector(state => state?.cart?.cartItems || {});
    const dispatch = useDispatch();

    const router = useRouter()

    // Fallback image for products without images
    const fallbackImage = 'https://ik.imagekit.io/osmanabdout/assets/product-placeholder.png';
    const [mainImage, setMainImage] = useState(product?.images?.[0] || fallbackImage);

    const addToCartHandler = () => {
        console.log('[ProductDetails] Add to Cart clicked');
        console.log('[ProductDetails] Product ID:', productId);
        console.log('[ProductDetails] Product object:', product);
        console.log('[ProductDetails] Current cart state:', cart);
        console.log('[ProductDetails] Dispatching addToCart action...');

        dispatch(addToCart(productId));  // Fixed: Pass productId directly, not as an object

        console.log('[ProductDetails] addToCart action dispatched');
    }

    const averageRating = product.rating && product.rating.length > 0
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : 0;
    
    // Use fallback if no images available
    const displayImages = product?.images?.length > 0 ? product.images : [fallbackImage];

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {displayImages.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(displayImages[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <OptimizedImage
                                src={image}
                                className="group-hover:scale-103 group-active:scale-95 transition"
                                alt={product.name}
                                width={45}
                                height={45}
                                transformation={[
                                    { width: 90, height: 90, quality: 80 }
                                ]}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <OptimizedImage
                        src={mainImage}
                        alt={product.name}
                        width={250}
                        height={250}
                        transformation={[
                            { width: 500, height: 500, quality: 90 }
                        ]}
                    />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} {dict?.product?.reviews || "Reviews"}</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p className="flex items-center gap-1"> <CurrencyIcon className="w-5 h-5" width={20} height={20} />{product.price} </p>
                    <p className="text-xl text-slate-500 line-through flex items-center gap-1"><CurrencyIcon className="w-4 h-4" width={16} height={16} />{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>{dict?.product?.save || "Save"} {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% {dict?.product?.rightNow || "right now"}</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">{dict?.product?.quantity || "Quantity"}</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {!cart[productId] ? (dict?.product?.addToCart || 'Add to Cart') : (dict?.product?.viewCart || 'View Cart')}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> {dict?.product?.freeShippingWorldwide || "Free shipping worldwide"} </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> {dict?.product?.securedPayment || "100% Secured Payment"} </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> {dict?.product?.trustedByBrands || "Trusted by top brands"} </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails