import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryBannerService from "../../services/categoryBannerService";

const initialState = {
  showcase: [],
  banners: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const getShowcase = createAsyncThunk(
  "categoryBanner/getShowcase",
  async (_, thunkAPI) => {
    try {
      return await categoryBannerService.getShowcase();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getAllCategoryBanners = createAsyncThunk(
  "categoryBanner/getAllCategoryBanners",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await categoryBannerService.getAllCategoryBanners(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const upsertCategoryBanner = createAsyncThunk(
  "categoryBanner/upsertCategoryBanner",
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await categoryBannerService.upsertCategoryBanner(formData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteCategoryBanner = createAsyncThunk(
  "categoryBanner/deleteCategoryBanner",
  async (category, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await categoryBannerService.deleteCategoryBanner(category, token);
      return category;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const categoryBannerSlice = createSlice({
  name: "categoryBanner",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShowcase.fulfilled, (state, action) => {
        state.showcase = action.payload;
      })
      .addCase(getAllCategoryBanners.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCategoryBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
      })
      .addCase(getAllCategoryBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(upsertCategoryBanner.fulfilled, (state, action) => {
        const idx = state.banners.findIndex((b) => b.category === action.payload.category);
        if (idx >= 0) state.banners[idx] = action.payload;
        else state.banners.push(action.payload);
        state.isSuccess = true;
      })
      .addCase(upsertCategoryBanner.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteCategoryBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((b) => b.category !== action.payload);
      });
  },
});

export const { reset } = categoryBannerSlice.actions;
export default categoryBannerSlice.reducer;