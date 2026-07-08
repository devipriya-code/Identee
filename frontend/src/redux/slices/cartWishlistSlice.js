import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/userService";

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
      });
  },
});

export const { clearCartWishlist } = cartWishlistSlice.actions;
export default cartWishlistSlice.reducer;