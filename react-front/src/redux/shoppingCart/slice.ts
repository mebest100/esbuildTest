import instance from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface ShoppingCartState {
  loading: boolean;
  error: string | null;
  items: Array<any>;
}

const initialState: ShoppingCartState = {
  loading: true,
  error: null,
  items: [], // 初始值不应该为null, 而应该是一个空数组对象
};

export const getShoppingCart = createAsyncThunk(
  "shoppingCart/getShoppingCart",
  async (jwt: string, thunkAPI) => {
    const { data } = await instance.get(`/api/shoppingCart`, {      
      headers: {
        Authorization: `bearer ${jwt}`,
      },
    });

    // console.log("data is ", data);
    return data.shoppingCartItems;
  }
);

export const addShoppingCartItem = createAsyncThunk(
  "shoppingCart/addShoppingCartItem",
  async (parameters: { jwt: string; touristRouteId: string }, thunkAPI) => {
    const { data } = await instance.post(
      `/api/shoppingCart/items`,
      {
        touristRouteId: parameters.touristRouteId,
      },
      {
        headers: {
          Authorization: `bearer ${parameters.jwt}`,
        },
      }
    );   
    return data;
  }
);

export const clearShoppingCartItem = createAsyncThunk(
  "shoppingCart/clearShoppingCartItem",
  async (parameters: { jwt: string; itemIds: number[] }, thunkAPI) => {
    return await instance.delete(
      `/api/shoppingCart/items/(${parameters.itemIds.join(",")})`,

      {
        headers: {
          Authorization: `bearer ${parameters.jwt}`,
        },
      }
    );
  }
);

export const delSingleShoppingCartItem = createAsyncThunk(
  "shoppingCart/clearShoppingCartItem",
  async (parameters: { jwt: string; itemId: number }, thunkAPI) => {
    await instance.delete(`/api/shoppingCart/items/(${parameters.itemId})`, {
      headers: {
        Authorization: `bearer ${parameters.jwt}`,
      },
    });
    thunkAPI.dispatch(getShoppingCart(parameters.jwt));
  }
);

export const checkout = createAsyncThunk(
  "shoppingCart/checkout",
  async (jwt: string, thunkAPI) => {
    const { data } = await instance.post(`/api/shoppingCart/checkout`, null, {
      headers: {
        Authorization: `bearer ${jwt}`,
      },
    });
    return data;
  }
);

export const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: {
    [getShoppingCart.pending.type]: (state) => {
      state.loading = true;
    },
    [getShoppingCart.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    [getShoppingCart.rejected.type]: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    [addShoppingCartItem.pending.type]: (state) => {
      state.loading = true;
    },
    [addShoppingCartItem.fulfilled.type]: (state, action) => {
      state.loading = false;
      // 靠接口返回值来更新本地redux中的购物车是非常愚蠢的！ 请求在线接口和本地存储来处理购物车，这两种方案本来只能二选一，而不应该混在一起
      // 如果两个都使用时：添加购物车时就不应该依赖api返回值来更新本地redux。此时只需重新派发一次getShoppingCart即可
      // state.items = action.payload;
      state.error = null;
    },
    [addShoppingCartItem.rejected.type]: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    [delSingleShoppingCartItem.pending.type]: (state) => {
      state.loading = true;
    },
    [delSingleShoppingCartItem.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    [delSingleShoppingCartItem.rejected.type]: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },

    [clearShoppingCartItem.pending.type]: (state) => {
      state.loading = true;
    },
    [clearShoppingCartItem.fulfilled.type]: (state) => {
      state.loading = false;
      state.items = [];
      state.error = null;
    },
    [clearShoppingCartItem.rejected.type]: (
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
      state.items = [];
      state.error = null;
    },
    [checkout.rejected.type]: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
