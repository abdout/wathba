import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk to fetch addresses from API
export const fetchAddresses = createAsyncThunk(
    'address/fetchAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/user/addresses');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch addresses');
            }

            return data.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to delete an address
export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (addressId, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/user/addresses?id=${addressId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete address');
            }

            return addressId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to set default address
export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (addressId, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/user/addresses', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: addressId, isDefault: true }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set default address');
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
        loading: false,
        error: null,
        selectedAddressId: null,
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload);
            // If it's the first address or marked as default, select it
            if (state.list.length === 1 || action.payload.isDefault) {
                state.selectedAddressId = action.payload.id;
            }
        },
        selectAddress: (state, action) => {
            state.selectedAddressId = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch addresses
        builder
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                // Auto-select default address
                const defaultAddress = action.payload.find(addr => addr.isDefault);
                if (defaultAddress) {
                    state.selectedAddressId = defaultAddress.id;
                } else if (action.payload.length > 0) {
                    state.selectedAddressId = action.payload[0].id;
                }
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

        // Delete address
        builder
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.list = state.list.filter(addr => addr.id !== action.payload);
                // If deleted address was selected, select another
                if (state.selectedAddressId === action.payload) {
                    const defaultAddr = state.list.find(addr => addr.isDefault);
                    state.selectedAddressId = defaultAddr ? defaultAddr.id : (state.list[0]?.id || null);
                }
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.error = action.payload;
            })

        // Set default address
        builder
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                // Update all addresses' isDefault status
                state.list = state.list.map(addr => ({
                    ...addr,
                    isDefault: addr.id === action.payload.id
                }));
                // Select the new default address
                state.selectedAddressId = action.payload.id;
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.error = action.payload;
            })
    }
})

export const { addAddress, selectAddress, clearError } = addressSlice.actions

export default addressSlice.reducer