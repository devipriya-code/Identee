import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import shippingService from "../../services/shippingService";

const initialState = {
  freeShippingAbove: 0,
  shippingRules: [],
  isLoading: false,
  isError: false,
  message: "",
};

export const getShippingCost = createAsyncThunk(
  "shipping/getShippingCost",
  async (_, thunkAPI) => {
    try {
      return await shippingService.getShippingCost();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const addState = createAsyncThunk(
  "shipping/addState",
  async (payload, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await shippingService.addState(payload, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateState = createAsyncThunk(
  "shipping/updateState",
  async ({ id, cost }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await shippingService.updateState(id, cost, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deleteState = createAsyncThunk(
  "shipping/deleteState",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await shippingService.deleteState(id, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateFreeShipping = createAsyncThunk(
  "shipping/updateFreeShipping",
  async (freeShippingAbove, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await shippingService.updateFreeShipping(freeShippingAbove, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// All five endpoints return the full ShippingCost document, so every
// fulfilled case just re-applies it to state — one source of truth,
// no risk of the UI drifting out of sync with what's actually in the DB.
const applySettings = (state, payload) => {
  state.freeShippingAbove = payload.freeShippingAbove ?? 0;
  state.shippingRules = payload.shippingRules ?? [];
};

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShippingError: (state) => {
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShippingCost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getShippingCost.fulfilled, (state, action) => {
        state.isLoading = false;
        applySettings(state, action.payload);
      })
      .addCase(getShippingCost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addState.fulfilled, (state, action) => {
        applySettings(state, action.payload);
      })
      .addCase(addState.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        applySettings(state, action.payload);
      })
      .addCase(updateState.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        applySettings(state, action.payload);
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateFreeShipping.fulfilled, (state, action) => {
        applySettings(state, action.payload);
      })
      .addCase(updateFreeShipping.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetShippingError } = shippingSlice.actions;
export default shippingSlice.reducer;
