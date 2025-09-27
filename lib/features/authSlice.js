import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  storeInfo: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.isLoading = false;
      state.role = action.payload.user?.publicMetadata?.role || 'customer';

      // Set store info if user is a vendor
      if (state.role === 'vendor' && action.payload.user?.publicMetadata?.storeData) {
        state.storeInfo = action.payload.user.publicMetadata.storeData;
      } else {
        state.storeInfo = null;
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.role = null;
      state.storeInfo = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateStoreInfo: (state, action) => {
      if (state.storeInfo) {
        state.storeInfo = { ...state.storeInfo, ...action.payload };
      }
    },
    setStoreApproved: (state, action) => {
      if (state.user?.publicMetadata) {
        state.user.publicMetadata.storeApproved = action.payload;
      }
      if (state.storeInfo) {
        state.storeInfo.status = action.payload ? 'approved' : 'pending';
        state.storeInfo.isActive = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setLoading, updateStoreInfo, setStoreApproved } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectUserRole = (state) => state.auth.role;
export const selectStoreInfo = (state) => state.auth.storeInfo;
export const selectIsAdmin = (state) => state.auth.role === 'admin';
export const selectIsVendor = (state) => state.auth.role === 'vendor';
export const selectIsStoreApproved = (state) =>
  state.auth.role === 'vendor' && state.auth.user?.publicMetadata?.storeApproved === true;

export default authSlice.reducer;