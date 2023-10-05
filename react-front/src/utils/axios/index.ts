import axios, { AxiosError } from "axios";
import history from "../history";

import { userSlice } from "@/redux/user/slice";

import { message } from "antd";


// const baseURL = "http://82.157.43.234:8080";
const instance = axios.create({
  // baseURL,
  headers: {
    "x-icode": "0EABAA984A686F10",
    // "x-icode": "qKhDxI15yz",
  },
});

let store;

export const injectStore = (_store) => {
  store = _store;
};

// 全局路由拦截
instance.interceptors.response.use(
  (response) => {
    // console.log("response is ===>",response);
    return response;
  },
  (error: AxiosError|any) => {
    if (!error.response) {
      message.error("网络异常", 3);
    } else if ( error.response.status == 401) {
      error.response.data.err
        ? message.error(error.response.data.err)
        : message.error("用户身份不合法，请重新登录！");
      store.dispatch(userSlice.actions.logOut()); // 注意：这里logOut后面的括号一定不能少！！！否则action不会派发成功！
      history.push("/signin");
    }
    else if ( error.response.status != 200) {
      console.log(error.response);
      error.response.data.err? message.error(error.response.data.err,3): null;
      // message.error("用户名不存在或密码错误！", 3);
      // store.dispatch(userSlice.actions.logOut());
      // history.push("/signin");
    } 
  
  }
);

export default instance;
