import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import settingService from "../../services/settingService";

const initialState = {
  byCategory: {}, // { general: [{key,type,category,description,isPublic,value}, ...] }
  isLoading: false,
  isSaving: false,
  isError: false,
  message: "",
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (category, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const data = await settingService.getSettings(category, token);
      return { category, data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const saveSettings = createAsyncThunk(
  "settings/save",
  async ({ category, values }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await settingService.updateSettingsBulk(category, values, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettingsStatus: (state) => {
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.byCategory[action.payload.category] = action.payload.data;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveSettings.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        const list = state.byCategory[action.payload.category] || [];
        state.byCategory[action.payload.category] = list.map((s) => ({
          ...s,
          value: action.payload.values[s.key] ?? s.value,
        }));
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetSettingsStatus } = settingSlice.actions;
export default settingSlice.reducer;
