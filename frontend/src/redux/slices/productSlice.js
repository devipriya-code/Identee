// redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";

const initialState = {
  products: [],
  product: null,
  categoryProducts: [],
  isCategoryLoading: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// GET PRODUCTS
export const getProducts = createAsyncThunk(
  "products/getAll",
  async (_, thunkAPI) => {
    try {
      return await productService.getProducts();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// GET PRODUCTS BY GARMENT STYLE (category listing page)
export const getProductsByGarmentStyle = createAsyncThunk(
  "products/getByGarmentStyle",
  async (garmentStyle, thunkAPI) => {
    try {
      return await productService.getProductsByGarmentStyle(garmentStyle);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// GET PRODUCT BY ID
export const getProductById = createAsyncThunk(
  "products/getById",
  async (id, thunkAPI) => {
    try {
      return await productService.getProductById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// CREATE PRODUCT
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await productService.createProduct(productData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// UPDATE PRODUCT
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, productData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await productService.updateProduct(id, productData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// DELETE PRODUCT
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await productService.deleteProduct(id, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── GET PRODUCTS ──────────────────────────────────
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ─── GET PRODUCTS BY GARMENT STYLE ──────────────────
      .addCase(getProductsByGarmentStyle.pending, (state) => {  
        state.isCategoryLoading = true;
      })
      .addCase(getProductsByGarmentStyle.fulfilled, (state, action) => {
        state.isCategoryLoading = false;
        state.categoryProducts = action.payload;
      })
      .addCase(getProductsByGarmentStyle.rejected, (state, action) => {
        state.isCategoryLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ─── GET PRODUCT BY ID ─────────────────────────────
      .addCase(getProductById.fulfilled, (state, action) => {
        state.product = action.payload;
      })

      // ─── CREATE PRODUCT ────────────────────────────────
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ─── UPDATE PRODUCT ────────────────────────────────
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ─── DELETE PRODUCT ────────────────────────────────
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.filter(
          (item) => item._id !== action.meta.arg,
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
