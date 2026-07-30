// redux/slices/garmentImageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import garmentImageService from "../../services/garmentImageService";

const initialState = {
  items: [], // all garment+color photo docs, fetched once
  isLoading: false,
  isUploading: false,
  isError: false,
  message: "",
};

export const fetchAllGarmentImages = createAsyncThunk(
  "garmentImage/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await garmentImageService.getAllGarmentImages();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const uploadGarmentViewPhoto = createAsyncThunk(
  "garmentImage/uploadViewPhoto",
  async ({ garmentType, colorSlug, colorName, colorHex, view, file }, thunkAPI) => {
    try {
      return await garmentImageService.uploadGarmentViewPhoto(
        garmentType,
        colorSlug,
        colorName, // 🆕 ADD THIS
        colorHex,
        view,
        file,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updatePrintArea = createAsyncThunk(
  "garmentImage/updatePrintArea",
  async ({ garmentType, colorSlug, view, printArea }, thunkAPI) => {
    try {
      return await garmentImageService.updatePrintArea(
        garmentType,
        colorSlug,
        view,
        printArea,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

function upsertDoc(items, doc) {
  const idx = items.findIndex(
    (d) => d.garmentType === doc.garmentType && d.colorSlug === doc.colorSlug,
  );
  if (idx === -1) return [...items, doc];
  const next = items.slice();
  next[idx] = doc;
  return next;
}

const garmentImageSlice = createSlice({
  name: "garmentImage",
  initialState,
  reducers: {
    resetGarmentImageStatus: (state) => {
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGarmentImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllGarmentImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllGarmentImages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadGarmentViewPhoto.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadGarmentViewPhoto.fulfilled, (state, action) => {
        state.isUploading = false;
        state.items = upsertDoc(state.items, action.payload);
      })
      .addCase(uploadGarmentViewPhoto.rejected, (state, action) => {
        state.isUploading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePrintArea.fulfilled, (state, action) => {
        state.items = upsertDoc(state.items, action.payload);
      });
  },
});

export const { resetGarmentImageStatus } = garmentImageSlice.actions;
export default garmentImageSlice.reducer;
