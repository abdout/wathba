'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProductPage({ dict, lang }) {
    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);
    const isRTL = lang === 'ar';

    const fetchProduct = async () => {
        const product = products.find((product) => product.id === productId);
        setProduct(product);
    }

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, products]);

    // Get translated product name
    const getProductName = (product) => {
        return dict?.productNames?.[product.name] || product.name;
    };

    // Get translated category
    const getCategoryName = (category) => {
        return dict?.categories?.[category] || category;
    };

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className={`text-gray-600 text-sm mt-8 mb-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span>{dict?.navigation?.home || "Home"}</span>
                    <span className="mx-2">/</span>
                    <span>{dict?.products?.title || "Products"}</span>
                    <span className="mx-2">/</span>
                    <span>{product && getCategoryName(product.category)}</span>
                </div>

                {/* Product Details */}
                {product && (
                    <ProductDetails
                        product={{...product, name: getProductName(product)}}
                        dict={dict}
                        lang={lang}
                    />
                )}

                {/* Description & Reviews */}
                {product && (
                    <ProductDescription
                        product={{...product, name: getProductName(product)}}
                        dict={dict}
                        lang={lang}
                    />
                )}
            </div>
        </div>
    );
}