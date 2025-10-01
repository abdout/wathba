'use client'
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton"
import { MoveLeftIcon, ChevronDown, ChevronUp } from "lucide-react"
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

    const [selectedCategory, setSelectedCategory] = useState(category || '')
    const [priceRange, setPriceRange] = useState({ min: 50, max: 1500 })
    const [selectedTags, setSelectedTags] = useState([])
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [displayCount, setDisplayCount] = useState(9)
    const [allProducts, setAllProducts] = useState([])
    const [isCategoryOpen, setIsCategoryOpen] = useState(true)
    const [isPriceOpen, setIsPriceOpen] = useState(true)
    const [isTagOpen, setIsTagOpen] = useState(true)

    const popularTags = ['Healthy', 'Low fat', 'Vegetarian', 'Kid foods', 'Vitamins', 'Bread', 'Meat', 'Snacks', 'Tiffin', 'Launch', 'Dinner', 'Breakfast', 'Fruit']

    // Load products on mount and when filters change
    useEffect(() => {
        const params = {
            page: 1,
            limit: 100, // Load all products
            ...(search && { search }),
            ...(selectedCategory && { category: selectedCategory }),
            ...(priceRange.min && { minPrice: priceRange.min }),
            ...(priceRange.max && { maxPrice: priceRange.max }),
            sortBy,
            sortOrder
        }
        dispatch(fetchProducts(params))
    }, [dispatch, search, selectedCategory, priceRange, sortBy, sortOrder])

    // Update all products when products load
    useEffect(() => {
        if (products && products.length > 0) {
            setAllProducts(products)
        }
    }, [products])

    // Load categories on mount
    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat)
        setDisplayCount(9)
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
        setDisplayCount(9)
    }

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
        setDisplayCount(9)
    }

    const handleSeeMore = () => {
        setDisplayCount(prev => prev + 9)
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

    const displayedProducts = allProducts.slice(0, displayCount)
    const hasMore = displayCount < allProducts.length

    // Calculate total count for All Categories
    const totalCategoryCount = categories.reduce((sum, cat) => sum + (cat.count || 0), 0)

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-6 gap-4">
                    <h1
                        onClick={() => router.push(`/${lang}/shop`)}
                        className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer"
                    >
                        {search && <MoveLeftIcon size={20} />}
                        {dict?.general?.all || 'All'} <span className="text-slate-700 font-medium">{dict?.products?.products || 'Products'}</span>
                        {search && <span className="text-sm">({dict?.shop?.searchResults || 'Search results for'}: "{search}")</span>}
                    </h1>

                    {/* Sort - Mobile friendly */}
                    <div className="relative">
                        <select
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:border-blue-500 text-sm"
                        >
                            <option value="newest">{dict?.shop?.newest || 'Newest'}</option>
                            <option value="price-asc">{dict?.shop?.priceLowToHigh || 'Price: Low to High'}</option>
                            <option value="price-desc">{dict?.shop?.priceHighToLow || 'Price: High to Low'}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
                    </div>
                </div>

                {/* Main Layout - Sidebar + Products */}
                <div className="flex gap-6">
                    {/* Sidebar Filter */}
                    <div className="hidden lg:block w-[280px] flex-shrink-0">
                        <div className="p-6 sticky top-6">
                            {/* Category Filter */}
                            <div className="mb-6">
                                <div
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                >
                                    <h3 className="font-medium text-slate-800">Filter</h3>
                                    {isCategoryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {isCategoryOpen && (
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={selectedCategory === ''}
                                                    onChange={() => handleCategoryChange('')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:border-green-500 transition-colors duration-200"></div>
                                                <div className="absolute w-3 h-3 bg-green-500 rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                                            </div>
                                            <span className="text-sm text-slate-700 flex-1">
                                                All Categories <span className="text-gray-400">({totalCategoryCount})</span>
                                            </span>
                                        </label>
                                        {categories.slice(0, 6).map((cat) => (
                                            <label key={cat.name || cat} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={selectedCategory === (cat.name || cat)}
                                                        onChange={() => handleCategoryChange(cat.name || cat)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:border-green-500 transition-colors duration-200"></div>
                                                    <div className="absolute w-3 h-3 bg-green-500 rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                                                </div>
                                                <span className="text-sm text-slate-700 flex-1">
                                                    {cat.name || cat} <span className="text-gray-400">({cat.count || 0})</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-300 my-4"></div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <div
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                                >
                                    <h3 className="font-medium text-slate-800">Price</h3>
                                    {isPriceOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {isPriceOpen && (
                                    <div>
                                        <div className="relative h-1 bg-gray-200 rounded-full mb-6">
                                            {/* Green bar between min and max */}
                                            <div
                                                className="absolute h-full bg-green-500 rounded-full"
                                                style={{
                                                    left: `${(priceRange.min / 2000) * 100}%`,
                                                    right: `${100 - (priceRange.max / 2000) * 100}%`
                                                }}
                                            />
                                            {/* Min slider */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000"
                                                value={priceRange.min}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value < priceRange.max) {
                                                        setPriceRange(prev => ({ ...prev, min: value }));
                                                    }
                                                }}
                                                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer"
                                                style={{ zIndex: priceRange.min > 2000 - priceRange.max ? 5 : 3 }}
                                            />
                                            {/* Max slider */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000"
                                                value={priceRange.max}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value > priceRange.min) {
                                                        setPriceRange(prev => ({ ...prev, max: value }));
                                                    }
                                                }}
                                                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer"
                                                style={{ zIndex: 4 }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-slate-700">
                                            <span>Price: {priceRange.min} — {priceRange.max}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-300 my-4"></div>

                            {/* Popular Tags */}
                            <div>
                                <div
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => setIsTagOpen(!isTagOpen)}
                                >
                                    <h3 className="font-medium text-slate-800">Popular Tag</h3>
                                    {isTagOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {isTagOpen && (
                                    <div className="flex flex-wrap gap-2">
                                        {popularTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-3 py-1 rounded-full text-sm transition ${
                                                    selectedTags.includes(tag)
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-white text-slate-700 hover:bg-green-100'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid - 3 columns */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-32">
                                {[...Array(9)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                                    {displayedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} dict={dict} lang={lang} />
                                    ))}
                                </div>

                                {displayedProducts.length === 0 && (
                                    <div className="text-center text-slate-500 py-20">
                                        <p className="text-xl">{dict?.shop?.noProductsFound || 'No products found'}</p>
                                    </div>
                                )}

                                {/* See More Button */}
                                {hasMore && (
                                    <div className="flex justify-center mb-12">
                                        <button
                                            onClick={handleSeeMore}
                                            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                                        >
                                            {dict?.shop?.seeMore || 'See More'}
                                        </button>
                                    </div>
                                )}

                                {/* Results Info */}
                                {displayedProducts.length > 0 && (
                                    <div className="text-center text-gray-500 text-sm mb-8">
                                        {dict?.shop?.showing || 'Showing'} {displayedProducts.length} {dict?.shop?.of || 'of'} {allProducts.length} {dict?.shop?.products || 'products'}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
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