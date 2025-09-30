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

            // Validate productId
            if (!productId) {
                console.error('[cartSlice] Invalid productId:', productId);
                return;
            }

            if (state.cartItems[productId]) {
                state.cartItems[productId]++;
            } else {
                state.cartItems[productId] = 1;
            }
            state.total += 1;
        },
        removeFromCartLocal: (state, action) => {
            const { productId } = action.payload;

            // Validate productId
            if (!productId) {
                console.error('[cartSlice] Invalid productId in removeFromCartLocal:', productId);
                return;
            }

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

            // Validate productId
            if (!productId) {
                console.error('[cartSlice] Invalid productId in deleteItemFromCartLocal:', productId);
                return;
            }

            state.total -= state.cartItems[productId] || 0;
            delete state.cartItems[productId];
        },
        clearCart: (state) => {
            state.cartItems = {};
            state.total = 0;
        },
        cleanupCart: (state) => {
            // Remove any invalid entries from cart
            const cleanedCart = {};
            for (const [key, value] of Object.entries(state.cartItems || {})) {
                if (key && key !== 'undefined' && key !== 'null' && typeof value === 'number' && value > 0) {
                    cleanedCart[key] = value;
                }
            }
            state.cartItems = cleanedCart;
            state.total = Object.values(cleanedCart).reduce((sum, qty) => sum + qty, 0);
        },
        setCart: (state, action) => {
            // Clean up any invalid entries before setting
            const cleanedCart = {};
            for (const [key, value] of Object.entries(action.payload || {})) {
                if (key && key !== 'undefined' && key !== 'null' && typeof value === 'number' && value > 0) {
                    cleanedCart[key] = value;
                }
            }
            state.cartItems = cleanedCart;
            state.total = Object.values(cleanedCart).reduce((sum, qty) => sum + qty, 0);
        },
        // Rollback actions for error recovery
        rollbackAddToCart: (state, action) => {
            const { productId } = action.payload;
            if (state.cartItems[productId] > 1) {
                state.cartItems[productId]--;
            } else {
                delete state.cartItems[productId];
            }
            state.total = Math.max(0, state.total - 1);
        },
        rollbackRemoveFromCart: (state, action) => {
            const { productId, previousQuantity } = action.payload;
            state.cartItems[productId] = previousQuantity;
            state.total += 1;
        },
        rollbackDeleteItem: (state, action) => {
            const { productId, previousQuantity } = action.payload;
            state.cartItems[productId] = previousQuantity;
            state.total += previousQuantity;
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
    cleanupCart,
    setCart,
    rollbackAddToCart,
    rollbackRemoveFromCart,
    rollbackDeleteItem
} = cartSlice.actions;

// Thunk actions that combine local update with backend sync
export const addToCart = (productId) => async (dispatch, getState) => {
    // Update local state immediately for better UX
    dispatch(addToCartLocal({ productId }));

    // Get current quantity after local update
    const currentCart = getState().cart.cartItems;
    const newQuantity = currentCart[productId] || 1;

    // Then sync with backend
    try {
        const result = await dispatch(updateCartItem({ productId, quantity: newQuantity }));
        if (updateCartItem.rejected.match(result)) {
            throw new Error(result.error?.message || 'Failed to sync cart');
        }
        return result.payload;
    } catch (error) {
        console.error('[cartSlice] Failed to sync cart with backend, rolling back:', error);
        // Rollback the local change on failure
        dispatch(rollbackAddToCart({ productId }));

        // Optionally show user notification (requires toast setup)
        // toast.error('Failed to add item to cart. Please try again.');

        throw error; // Re-throw to allow components to handle the error
    }
};

export const removeFromCart = (productId) => async (dispatch, getState) => {
    const previousQuantity = getState().cart.cartItems[productId] || 0;

    if (previousQuantity > 1) {
        // Update local state
        dispatch(removeFromCartLocal({ productId }));

        // Sync with backend
        try {
            const result = await dispatch(updateCartItem({ productId, quantity: previousQuantity - 1 }));
            if (updateCartItem.rejected.match(result)) {
                throw new Error(result.error?.message || 'Failed to sync cart');
            }
        } catch (error) {
            console.error('Failed to sync cart, rolling back:', error);
            // Rollback on failure
            dispatch(rollbackRemoveFromCart({ productId, previousQuantity }));
        }
    } else if (previousQuantity === 1) {
        // Remove item completely
        dispatch(deleteItemFromCartLocal({ productId }));

        try {
            const result = await dispatch(removeCartItem(productId));
            if (removeCartItem.rejected.match(result)) {
                throw new Error(result.error?.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Failed to sync cart, rolling back:', error);
            // Rollback on failure
            dispatch(rollbackDeleteItem({ productId, previousQuantity }));
        }
    }
};

export const deleteItemFromCart = (productId) => async (dispatch, getState) => {
    // Store previous quantity for rollback
    const previousQuantity = getState().cart.cartItems[productId];

    if (!previousQuantity) return; // Item not in cart

    // Update local state
    dispatch(deleteItemFromCartLocal({ productId }));

    // Sync with backend
    try {
        const result = await dispatch(removeCartItem(productId));
        if (removeCartItem.rejected.match(result)) {
            throw new Error(result.error?.message || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Failed to sync cart, rolling back:', error);
        // Rollback on failure
        dispatch(rollbackDeleteItem({ productId, previousQuantity }));
    }
};

export default cartSlice.reducer;