import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely serialize user data
const serializeUser = (user) => {
  if (!user) return null;

  // Create a clean serializable object
  const serialized = {
    id: user.id,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    fullName: user.fullName || null,
    username: user.username || null,
    primaryEmailAddressId: user.primaryEmailAddressId || null,
    imageUrl: user.imageUrl || null,
  };

  // Safely serialize email addresses
  if (user.emailAddresses && Array.isArray(user.emailAddresses)) {
    serialized.emailAddresses = user.emailAddresses.map(email => ({
      emailAddress: email.emailAddress || '',
      id: email.id || ''
    }));
  } else {
    serialized.emailAddresses = [];
  }

  // Safely serialize metadata - ensure it's a plain object
  try {
    serialized.publicMetadata = user.publicMetadata ? JSON.parse(JSON.stringify(user.publicMetadata)) : {};
    serialized.privateMetadata = user.privateMetadata ? JSON.parse(JSON.stringify(user.privateMetadata)) : {};
  } catch (e) {
    serialized.publicMetadata = {};
    serialized.privateMetadata = {};
  }

  // Convert dates to strings
  serialized.createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : null;
  serialized.updatedAt = user.updatedAt ? new Date(user.updatedAt).toISOString() : null;

  return serialized;
};

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
      const user = action.payload.user;

      // Use the helper function to safely serialize user data
      state.user = serializeUser(user);

      state.isAuthenticated = !!user;
      state.isLoading = false;
      state.role = user?.publicMetadata?.role || 'customer';

      // Set store info if user is a vendor
      if (state.role === 'vendor' && user?.publicMetadata?.storeData) {
        state.storeInfo = user.publicMetadata.storeData;
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