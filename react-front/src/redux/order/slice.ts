import instance from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { checkout } from "../shoppingCart/slice";

interface OrderState {
  loading: boolean;
  error: string | null;
  currentOrder: any;
}

const initialState: OrderState = {
  loading: false,
  error: null,
  currentOrder: null,
};

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (parameters: { jwt: string; orderId: string }, thunkAPI) => {
    const response = await instance.post(
      `/api/orders/placeOrder/${parameters.orderId}`,
      null,
      {
        headers: {
          Authorization: `bearer ${parameters.jwt}`,
        },
      }
    );

    if (response.status == 200) return "Completed";
  }
);

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: {
    [placeOrder.pending.type]: (state) => {
      state.loading = true;
    },
    [placeOrder.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.currentOrder.state = action.payload;
      state.error = null;
    },
    [placeOrder.rejected.type]: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    [checkout.pending.type]: (state) => {
      state.loading = true;
    },
    [checkout.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.error = null;
    },
    [checkout.rejected.type]: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
