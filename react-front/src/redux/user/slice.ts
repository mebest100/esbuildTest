import instance from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface UserState {
  loading: boolean;
  error: string | null;
  token: string | null;
}

 
const initialState: UserState = {
  loading: false,
  error: null,
  token: null,
};


export const signIn = createAsyncThunk(
  "user/signIn",
  async (
    parameters: {
      email: string;
      password: string;
    },
    thunkAPI
  ) => {
    console.log("signIn Action done! ");
    
    
    const { data } = await instance.post("/auth/login", {
      email: parameters.email,
      password: parameters.password,
    });    
    // const navigate = useNavigate(); //注意这里useNavigate()不能放到axios请求之前，否则会影响网络请求，导致请求失败
    //   navigate("/");
      return data.token;    
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logOut: (state) => {
      state.token = null;
      state.error = null;
      state.loading = false;
    },  
    // 手动设置token测试（设置无效token，看看后端会不会报错）
    setToken: (state,action) => { // 有传参的情况，对state传参的形式参数是action,通过action.payload来传递
      state.token = action.payload.token;
    }
  },
  extraReducers: {
    [signIn.pending.type]: (state) => {
      state.loading = true;
    },
    [signIn.fulfilled.type]: (state, action) => {
      state.loading = false;
      state.token = action.payload;
    },
    [signIn.rejected.type]: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
