import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}) => {
        console.log('[productSlice] fetchProducts thunk called with params:', params);

        const queryParams = new URLSearchParams({
            page: params.page || 1,
            limit: params.limit || 12,
            ...(params.category && { category: params.category }),
            ...(params.minPrice && { minPrice: params.minPrice }),
            ...(params.maxPrice && { maxPrice: params.maxPrice }),
            ...(params.search && { search: params.search }),
            ...(params.sortBy && { sortBy: params.sortBy }),
            ...(params.sortOrder && { sortOrder: params.sortOrder })
        });

        // Use absolute URL with window.location.origin for client-side fetches
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${baseUrl}/api/products?${queryParams}`;

        console.log('[productSlice] Fetching from URL:', url);
        console.log('[productSlice] Query parameters:', queryParams.toString());

        try {
            const response = await fetch(url);
            console.log('[productSlice] Response status:', response.status);
            console.log('[productSlice] Response ok:', response.ok);
            console.log('[productSlice] Response headers:', response.headers);

            const data = await response.json();
            console.log('[productSlice] Response data:', data);
            console.log('[productSlice] Data success:', data.success);
            console.log('[productSlice] Data.data:', data.data);

            if (!response.ok || !data.success) {
                console.error('[productSlice] Fetch failed - Response not ok or data.success false');
                console.error('[productSlice] Error:', data.error);
                throw new Error(data.error || 'Failed to fetch products');
            }

            console.log('[productSlice] Fetch successful, returning data:', data.data);
            return data.data;
        } catch (error) {
            console.error('[productSlice] Fetch error caught:', error);
            console.error('[productSlice] Error message:', error.message);
            console.error('[productSlice] Error stack:', error.stack);
            throw error;
        }
    }
);

// Async thunk for fetching single product
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/products/${productId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch product');
        }

        return data.data;
    }
);

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
    async () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/products/categories`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch categories');
        }

        return data.data;
    }
);

// Async thunk for searching products
export const searchProducts = createAsyncThunk(
    'products/searchProducts',
    async (query) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to search products');
        }

        return data.data;
    }
);

// Async thunk for fetching featured products
export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeaturedProducts',
    async (limit = 8) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/products/featured?limit=${limit}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch featured products');
        }

        return data.data;
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        currentProduct: null,
        featuredProducts: [],
        categories: [],
        searchResults: [],
        pagination: {
            page: 1,
            limit: 12,
            totalPages: 1,
            totalCount: 0
        },
        filters: {
            category: null,
            minPrice: null,
            maxPrice: null,
            search: null,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        },
        loading: false,
        error: null
    },
    reducers: {
        setProducts: (state, action) => {
            state.list = action.payload;
        },
        clearProducts: (state) => {
            state.list = [];
            state.currentProduct = null;
            state.searchResults = [];
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                category: null,
                minPrice: null,
                maxPrice: null,
                search: null,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch products
        builder
            .addCase(fetchProducts.pending, (state) => {
                console.log('[productSlice] fetchProducts.pending - Setting loading to true');
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                console.log('[productSlice] fetchProducts.fulfilled');
                console.log('[productSlice] Action payload:', action.payload);
                console.log('[productSlice] Payload products:', action.payload?.products);
                console.log('[productSlice] Payload pagination:', action.payload?.pagination);

                state.loading = false;
                state.list = action.payload.products;
                state.pagination = action.payload.pagination;
                if (action.payload.filters) {
                    state.categories = action.payload.filters.categories;
                }

                console.log('[productSlice] State updated - products list length:', state.list?.length);
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                console.error('[productSlice] fetchProducts.rejected');
                console.error('[productSlice] Rejection error:', action.error);
                console.error('[productSlice] Error message:', action.error.message);
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch single product
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Search products
            .addCase(searchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch featured products
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredProducts = action.payload;
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { setProducts, clearProducts, setFilters, clearFilters, setCurrentProduct } = productSlice.actions;

export default productSlice.reducer;