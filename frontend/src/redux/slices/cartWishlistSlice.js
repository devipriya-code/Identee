import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/userService";
import cartService from "../../services/cartService";

export const fetchFavorites = createAsyncThunk(
  "cartWishlist/fetchFavorites",
  async (token, thunkAPI) => {
    try {
      if (!token) return [];
      return await userService.getFavorites(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const fetchCart = createAsyncThunk(
  "cartWishlist/fetchCart",
  async (token, thunkAPI) => {
    try {
      if (!token) return [];
      return await userService.getCart(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ✅ NEW — updates qty on an existing cart line (+/− buttons on CartPage)
export const updateCartItemQty = createAsyncThunk(
  "cartWishlist/updateCartItemQty",
  async ({ productId, cartItemId, size, qty, token }, thunkAPI) => {
    try {
      return await cartService.updateCartItemQty(
        productId,
        cartItemId,
        size,
        qty,
        token,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

// ✅ NEW — removes a cart line entirely (Remove button on CartPage)
export const removeCartItem = createAsyncThunk(
  "cartWishlist/removeCartItem",
  async ({ cartItemId, token }, thunkAPI) => {
    try {
      return await cartService.removeCartItem(cartItemId, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

const cartWishlistSlice = createSlice({
  name: "cartWishlist",
  initialState: {
    favorites: [],
    cartItems: [],
    loading: false,
  },
  reducers: {
    clearCartWishlist: (state) => {
      state.favorites = [];
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload || [];
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartItems = action.payload || [];
      })
      // ✅ NEW — both endpoints return { cartItems }, so just sync state
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.cartItems = action.payload?.cartItems || state.cartItems;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cartItems = action.payload?.cartItems || state.cartItems;
      });
  },
});

export const { clearCartWishlist } = cartWishlistSlice.actions;
export default cartWishlistSlice.reducer;
