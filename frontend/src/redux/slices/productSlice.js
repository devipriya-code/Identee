// redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";

const initialState = {
  products: [],
  product: null,
  categoryProducts: [],
  isCategoryLoading: false,
  fullProduct: null,
  isFullLoading: false,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

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

export const getProductFull = createAsyncThunk(
  "products/getFull",
  async (id, thunkAPI) => {
    try {
      return await productService.getProductFull(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// GET PRODUCTS BY GARMENT STYLE — used by both the navbar's category page
// and (indirectly, via getCategoryShowcase) the Home page banners.
export const getProductsByGarmentStyle = createAsyncThunk(
  "products/getByGarmentStyle",
  async ({ garmentStyle, subcategory }, thunkAPI) => {
    try {
      return await productService.getProductsByGarmentStyle({
        garmentStyle,
        subcategory,
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

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

      .addCase(getProductFull.pending, (state) => {
        state.isFullLoading = true;
        state.isError = false;
        state.message = "";
        state.fullProduct = null;
      })
      .addCase(getProductFull.fulfilled, (state, action) => {
        state.isFullLoading = false;
        state.isError = false;
        state.fullProduct = action.payload;
      })
      .addCase(getProductFull.rejected, (state, action) => {
        state.isFullLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

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

      .addCase(getProductById.fulfilled, (state, action) => {
        state.product = action.payload;
      })

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
