import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bannerService from "../../services/bannerService";

const initialState = {
  activeOffer: null,
  offers: [],
  videoBanner: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// ── OFFER BANNER THUNKS ──────────────────────────────────────────
export const getActiveOffer = createAsyncThunk(
  "banner/getActiveOffer",
  async (_, thunkAPI) => {
    try {
      return await bannerService.getActiveOffer();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getAllOffers = createAsyncThunk(
  "banner/getAllOffers",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bannerService.getAllOffers(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createOffer = createAsyncThunk(
  "banner/createOffer",
  async (offerText, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bannerService.createOffer(offerText, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateOffer = createAsyncThunk(
  "banner/updateOffer",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bannerService.updateOffer(id, data, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteOffer = createAsyncThunk(
  "banner/deleteOffer",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await bannerService.deleteOffer(id, token);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const activateOffer = createAsyncThunk(
  "banner/activateOffer",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bannerService.activateOffer(id, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ── VIDEO BANNER THUNKS ──────────────────────────────────────────
export const getVideoBanner = createAsyncThunk(
  "banner/getVideoBanner",
  async (_, thunkAPI) => {
    try {
      return await bannerService.getVideoBanner();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const addVideoBanner = createAsyncThunk(
  "banner/addVideoBanner",
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bannerService.addVideoBanner(formData, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteVideoBanner = createAsyncThunk(
  "banner/deleteVideoBanner",
  async (videoId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await bannerService.deleteVideoBanner(videoId, token);
      return videoId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const bannerSlice = createSlice({
  name: "banner",
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
      // active offer (public, used by Navbar)
      .addCase(getActiveOffer.fulfilled, (state, action) => {
        state.activeOffer = action.payload;
      })
      // all offers (admin list)
      .addCase(getAllOffers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offers = action.payload;
      })
      .addCase(getAllOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.offers.push(action.payload);
        state.isSuccess = true;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.offers = state.offers.map((o) =>
          o._id === action.payload._id ? action.payload : o,
        );
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((o) => o._id !== action.payload);
      })
      .addCase(activateOffer.fulfilled, (state, action) => {
        state.offers = state.offers.map((o) => ({
          ...o,
          isActive: o._id === action.payload._id,
        }));
        state.activeOffer = action.payload;
      })
      // video banner
      .addCase(getVideoBanner.fulfilled, (state, action) => {
        state.videoBanner =
          Array.isArray(action.payload) && action.payload.length > 0
            ? action.payload[0]
            : null;
      })
      .addCase(addVideoBanner.fulfilled, (state, action) => {
        state.videoBanner = action.payload.videoBanner;
        state.isSuccess = true;
      })
      .addCase(addVideoBanner.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteVideoBanner.fulfilled, (state) => {
        state.videoBanner = null;
      });
  },
});

export const { reset } = bannerSlice.actions;
export default bannerSlice.reducer;