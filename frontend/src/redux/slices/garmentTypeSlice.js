import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import garmentTypeService from "../../services/garmentTypeService";

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  message: "",
};

export const fetchGarmentTypes = createAsyncThunk(
  "garmentType/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await garmentTypeService.getGarmentTypes();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const createGarmentType = createAsyncThunk(
  "garmentType/create",
  async ({ label, category, basePrice }, thunkAPI) => {
    try {
      return await garmentTypeService.createGarmentType(
        label,
        category,
        basePrice,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateGarmentBasePrice = createAsyncThunk(
  "garmentType/updateBasePrice",
  async ({ id, basePrice }, thunkAPI) => {
    try {
      return await garmentTypeService.updateGarmentBasePrice(id, basePrice);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const addGarmentColor = createAsyncThunk(
  "garmentType/addColor",
  async ({ id, name, hex }, thunkAPI) => {
    try {
      return await garmentTypeService.addColor(id, name, hex);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const removeGarmentColor = createAsyncThunk(
  "garmentType/removeColor",
  async ({ id, slug }, thunkAPI) => {
    try {
      return await garmentTypeService.removeColor(id, slug);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deleteGarmentType = createAsyncThunk(
  "garmentType/delete",
  async (id, thunkAPI) => {
    try {
      await garmentTypeService.deleteGarmentType(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

function upsert(items, doc) {
  const idx = items.findIndex((i) => i._id === doc._id);
  if (idx === -1) return [...items, doc];
  const next = items.slice();
  next[idx] = doc;
  return next;
}

const garmentTypeSlice = createSlice({
  name: "garmentType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGarmentTypes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGarmentTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchGarmentTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createGarmentType.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload];
      })
      .addCase(updateGarmentBasePrice.fulfilled, (state, action) => {
        state.items = state.items.map((i) =>
          i._id === action.payload._id ? action.payload : i,
        );
      })
      .addCase(addGarmentColor.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload);
      })
      .addCase(removeGarmentColor.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload);
      })
      .addCase(deleteGarmentType.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default garmentTypeSlice.reducer;
