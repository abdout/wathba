import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}) => {
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

        const response = await fetch(`/api/products?${queryParams}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch products');
        }

        return data.data;
    }
);

// Async thunk for fetching single product
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId) => {
        const response = await fetch(`/api/products/${productId}`);
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
        const response = await fetch('/api/products/categories');
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
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
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
        const response = await fetch(`/api/products/featured?limit=${limit}`);
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
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.products;
                state.pagination = action.payload.pagination;
                if (action.payload.filters) {
                    state.categories = action.payload.filters.categories;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
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