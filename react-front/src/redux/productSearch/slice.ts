import instance from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd"

interface ProductSearchState {
  loading: boolean;
  error: string | null;
  data: any;
  pagination: any;
}

const initialState: ProductSearchState = {
  loading: true,
  error: null,
  data: null,
  pagination: null,
};

export const searchProduct = createAsyncThunk(
  "productSearch/searchProduct",
  async (
    parameters: {
      keyword?: string;
      nextPage: number | string;
      pageSize: number | string;
    },
    thunkAPI
  ) => {
    let url = `/api/touristRoutes?pageNumber=${parameters.nextPage}&pageSize=${parameters.pageSize}&p=` + Math.random();
    if (parameters.keyword) {
      url += `&keyword=${parameters.keyword}`;
    }
    const response = await instance.get(url);
    console.log("search result==>", response.data)
    let pagination = response.headers["x-pagination"] 
    
    
    if ( response.data.length == 0) {
      message.warn("无此旅游线路", 3)
      return {
        data: [],
        pagination: null
      }
    }

    return {
      data: response.data,

      //  注意：这里的需要判断pagination是否存在，否则JSON.parse有可能会解析失败, redux action不会派发成功，
      //  action状态会一直处于reject状态, 并报错：undefined" is not valid JSON
      pagination: JSON.parse(pagination ? pagination : ''),
    };
  }
);

export const productSearchSlice = createSlice({
  name: "productSearch",
  initialState,
  reducers: {},
  extraReducers: {
    [searchProduct.pending.type]: (state) => {
      state.loading = true;
    },
    [searchProduct.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.pagination = action.payload.pagination;
      state.data = action.payload.data;
      state.error = null;
    },
    [searchProduct.rejected.type]: (
      state,
      action: PayloadAction<string | null>
    ) => {
      // 这里action rejected之后并没有更新data和pagination数据
      state.loading = false;
      state.error = action.payload;
    },
  },
});
