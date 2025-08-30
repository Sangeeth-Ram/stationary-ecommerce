import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
  inventory: number;
}

interface CartState {
  items: CartItem[];
  isSynced: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isSynced: false,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart actions
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          id: `local-${Date.now()}`,
        });
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.isSynced = false;
    },

    // Sync actions
    syncCartStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    syncCartSuccess: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.isSynced = true;
      state.isLoading = false;
    },
    syncCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncCartStart,
  syncCartSuccess,
  syncCartFailure,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  );
export const selectIsCartSynced = (state: { cart: CartState }) =>
  state.cart.isSynced;
export const selectIsCartLoading = (state: { cart: CartState }) =>
  state.cart.isLoading;

export default cartSlice.reducer;
