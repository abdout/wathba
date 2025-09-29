'use client'
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton"
import { MoveLeftIcon, MoveRightIcon, Filter, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { fetchProducts, fetchCategories, setFilters } from "@/lib/features/product/productSlice"

function ShopContent({ dict, lang }) {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const router = useRouter()
    const dispatch = useDispatch()

    const { list: products, loading, error, pagination, categories } = useSelector(state => state.product)
    const isRTL = lang === 'ar';

    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCategory, setSelectedCategory] = useState(category || '')
    const [priceRange, setPriceRange] = useState({ min: '', max: '' })
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

    // Load products on mount and when filters change
    useEffect(() => {
        const params = {
            page: currentPage,
            limit: 12,
            ...(search && { search }),
            ...(selectedCategory && { category: selectedCategory }),
            ...(priceRange.min && { minPrice: priceRange.min }),
            ...(priceRange.max && { maxPrice: priceRange.max }),
            sortBy,
            sortOrder
        }
        dispatch(fetchProducts(params))
    }, [dispatch, currentPage, search, selectedCategory, priceRange, sortBy, sortOrder])

    // Load categories on mount
    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat)
        setCurrentPage(1)
        if (cat) {
            router.push(`/${lang}/shop?category=${cat}`)
        } else {
            router.push(`/${lang}/shop`)
        }
    }

    const handleSortChange = (newSortBy) => {
        if (newSortBy === 'price-asc') {
            setSortBy('price')
            setSortOrder('asc')
        } else if (newSortBy === 'price-desc') {
            setSortBy('price')
            setSortOrder('desc')
        } else {
            setSortBy('createdAt')
            setSortOrder('desc')
        }
        setCurrentPage(1)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{dict?.shop?.errorLoading || 'Error loading products'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {dict?.general?.retry || 'Retry'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-6 gap-4">
                    <h1
                        onClick={() => router.push(`/${lang}/shop`)}
                        className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer"
                    >
                        {search && (isRTL ? <MoveRightIcon size={20} /> : <MoveLeftIcon size={20} />)}
                        {dict?.general?.all || 'All'} <span className="text-slate-700 font-medium">{dict?.products?.products || 'Products'}</span>
                        {search && <span className="text-sm">({dict?.shop?.searchResults || 'Search results for'}: "{search}")</span>}
                    </h1>

                    {/* Filters and Sort */}
                    <div className="flex gap-4 items-center">
                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">{dict?.shop?.allCategories || 'All Categories'}</option>
                                {categories.map((cat) => (
                                    <option key={cat.name || cat} value={cat.name || cat}>
                                        {cat.name || cat} {cat.count && `(${cat.count})`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                            >
                                <option value="newest">{dict?.shop?.newest || 'Newest'}</option>
                                <option value="price-asc">{dict?.shop?.priceLowToHigh || 'Price: Low to High'}</option>
                                <option value="price-desc">{dict?.shop?.priceHighToLow || 'Price: High to Low'}</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-12 mb-32">
                        {[...Array(12)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-12 mb-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} dict={dict} lang={lang} />
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center text-slate-500 py-20">
                                <p className="text-xl">{dict?.shop?.noProductsFound || 'No products found'}</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-12">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === 1
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border hover:bg-gray-100'
                                    }`}
                                >
                                    {isRTL ? <MoveRightIcon size={20} /> : <MoveLeftIcon size={20} />}
                                </button>

                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const page = i + 1
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        page === 1 ||
                                        page === pagination.totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 rounded ${
                                                    currentPage === page
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white border hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page}>...</span>
                                    }
                                    return null
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === pagination.totalPages
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border hover:bg-gray-100'
                                    }`}
                                >
                                    {isRTL ? <MoveLeftIcon size={20} /> : <MoveRightIcon size={20} />}
                                </button>
                            </div>
                        )}

                        {/* Results Info */}
                        <div className="text-center text-gray-500 text-sm mb-8">
                            {dict?.shop?.showing || 'Showing'} {products.length} {dict?.shop?.of || 'of'} {pagination.totalCount} {dict?.shop?.products || 'products'}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default function ShopPage({ dict, lang }) {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">{dict?.general?.loading || 'Loading shop...'}</div>}>
            <ShopContent dict={dict} lang={lang} />
        </Suspense>
    )
}