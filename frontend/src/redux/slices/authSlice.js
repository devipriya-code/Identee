import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import authService from "../../services/authService";

const user = JSON.parse(localStorage.getItem("userInfo"));

const initialState = {
  user: user || null,
  profile: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// REGISTER
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// GET PROFILE
export const getProfile = createAsyncThunk(
  "auth/profile",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      return await authService.getProfile(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// UPDATE PROFILE
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      return await authService.updateProfile(profileData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// SEND OTP
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (emailData, thunkAPI) => {
    try {
      return await authService.sendOtp(emailData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// VERIFY OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, thunkAPI) => {
    try {
      return await authService.verifyOtp(otpData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, thunkAPI) => {
    try {
      return await authService.forgotPassword(emailData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, thunkAPI) => {
    try {
      return await authService.resetPassword(resetData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// LOGOUT
export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
});

const authSlice = createSlice({
  name: "auth",
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

      // REGISTER
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isSuccess = true;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isSuccess = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // PROFILE
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // UPDATE PROFILE
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.profile = action.payload;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
      });
  },
});

export const { reset } = authSlice.actions;

export default authSlice.reducer;
