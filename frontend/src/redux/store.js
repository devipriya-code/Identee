import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import bannerReducer from "./slices/bannerSlice";
import categoryBannerReducer from "./slices/categoryBannerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    banner: bannerReducer,
    categoryBanner: categoryBannerReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});