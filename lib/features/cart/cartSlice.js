import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for syncing cart with backend
export const syncCart = createAsyncThunk(
    'cart/syncCart',
    async (cartData) => {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cartData })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to sync cart');
        }

        return data.data;
    }
);

// Async thunk for fetching cart from backend
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async () => {
        const response = await fetch('/api/cart');
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch cart');
        }

        return data.data;
    }
);

// Async thunk for updating cart item
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, quantity }) => {
        const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to update cart');
        }

        return data.data;
    }
);

// Async thunk for removing cart item
export const removeCartItem = createAsyncThunk(
    'cart/removeCartItem',
    async (productId) => {
        const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to remove item');
        }

        return data.data;
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
        loading: false,
        error: null,
        lastSynced: null
    },
    reducers: {
        // Local-only actions for immediate UI updates
        addToCartLocal: (state, action) => {
            const { productId } = action.payload;
            if (state.cartItems[productId]) {
                state.cartItems[productId]++;
            } else {
                state.cartItems[productId] = 1;
            }
            state.total += 1;
        },
        removeFromCartLocal: (state, action) => {
            const { productId } = action.payload;
            if (state.cartItems[productId]) {
                state.cartItems[productId]--;
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId];
                }
                state.total -= 1;
            }
        },
        deleteItemFromCartLocal: (state, action) => {
            const { productId } = action.payload;
            state.total -= state.cartItems[productId] || 0;
            delete state.cartItems[productId];
        },
        clearCart: (state) => {
            state.cartItems = {};
            state.total = 0;
        },
        setCart: (state, action) => {
            state.cartItems = action.payload;
            state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0);
        }
    },
    extraReducers: (builder) => {
        // Sync cart
        builder
            .addCase(syncCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncCart.fulfilled, (state, action) => {
                state.loading = false;
                state.lastSynced = new Date().toISOString();
                if (action.payload) {
                    state.cartItems = action.payload;
                    state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0);
                }
            })
            .addCase(syncCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });

        // Fetch cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.lastSynced = new Date().toISOString();
                if (action.payload) {
                    state.cartItems = action.payload;
                    state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0);
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });

        // Update cart item
        builder
            .addCase(updateCartItem.fulfilled, (state, action) => {
                if (action.payload) {
                    state.cartItems = action.payload;
                    state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0);
                }
                state.lastSynced = new Date().toISOString();
            });

        // Remove cart item
        builder
            .addCase(removeCartItem.fulfilled, (state, action) => {
                if (action.payload) {
                    state.cartItems = action.payload;
                    state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0);
                }
                state.lastSynced = new Date().toISOString();
            });
    }
});

// Export actions
export const {
    addToCartLocal,
    removeFromCartLocal,
    deleteItemFromCartLocal,
    clearCart,
    setCart
} = cartSlice.actions;

// Thunk actions that combine local update with backend sync
export const addToCart = (productId) => async (dispatch) => {
    // Update local state immediately for better UX
    dispatch(addToCartLocal({ productId }));

    // Then sync with backend
    try {
        const newQuantity = 1; // Or get from state
        await dispatch(updateCartItem({ productId, quantity: newQuantity }));
    } catch (error) {
        console.error('Failed to sync cart:', error);
    }
};

export const removeFromCart = (productId) => async (dispatch, getState) => {
    const currentQuantity = getState().cart.cartItems[productId] || 0;

    if (currentQuantity > 1) {
        // Update local state
        dispatch(removeFromCartLocal({ productId }));

        // Sync with backend
        try {
            await dispatch(updateCartItem({ productId, quantity: currentQuantity - 1 }));
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    } else {
        // Remove item completely
        dispatch(deleteItemFromCartLocal({ productId }));

        try {
            await dispatch(removeCartItem(productId));
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    }
};

export const deleteItemFromCart = (productId) => async (dispatch) => {
    // Update local state
    dispatch(deleteItemFromCartLocal({ productId }));

    // Sync with backend
    try {
        await dispatch(removeCartItem(productId));
    } catch (error) {
        console.error('Failed to sync cart:', error);
    }
};

export default cartSlice.reducer;