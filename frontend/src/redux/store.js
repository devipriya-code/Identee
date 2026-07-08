import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import bannerReducer from "./slices/bannerSlice";
import categoryBannerReducer from "./slices/categoryBannerSlice";
import customizationReducer from "./slices/customizationSlice";
import userManagementReducer from "./slices/userManagementSlice";
import orderReducer from "./slices/orderSlice";
import cartWishlistReducer from "./slices/cartWishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    banner: bannerReducer,
    categoryBanner: categoryBannerReducer,
    customization: customizationReducer,
    userManagement: userManagementReducer,
    orders: orderReducer,
    cartWishlist: cartWishlistReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
