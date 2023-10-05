const fs = require("fs");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const short = require("short-uuid");

const bodyParser = require("body-parser");
const { default: jwtDecode } = require("jwt-decode");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//异常处理
app.use(function (err, req, res, next) {
  if (err) {
    console.log("err inception: ", err);
    return res.json({
      status: 500,
      message: err.message,
    });
    //   next()
  }
});

// 用户注册
app.post("/auth/register", (req, res) => {
  let appData = require("./DbData/user.json");
  let userinfo = appData.users;
  let username = req.body.email;
  let password = req.body.password;

  if (username in userinfo) {
    res.statusCode = 400;
    return res.json({
      err: "该用户名已存在！",
    });
  }

  userinfo[username] = {};
  userinfo[username].username = username;
  userinfo[username].password = password;

  updateDbJson("./DbData/user.json", appData, res);
});

//用户登录
app.post("/auth/login", (req, res) => {
  let appData = require("./DbData/user.json");
  let userinfo = appData.users;
  console.log("req.body===>", req.body);
  let username = req.body.email;
  let password = req.body.password;
  let jwtSalt = "jasdouowem34w543250948340@56";

  console.log("username is", username);

  if (!(username in userinfo)) {
    res.statusCode = 400;
    return res.json({
      err: "用户不存在！",
    });
  }

  if (userinfo[username].password != password) {
    res.statusCode = 400;
    return res.json({
      err: "用户密码错误！",
    });
  } else {
    token = jwt.sign({ username }, jwtSalt);
    userinfo[username].token = token;
    fs.writeFile("./DbData/user.json", JSON.stringify(appData), (err) => {
      console.log("文件写入失败，错误为： ", err);
    });
    return res.json({
      token,
      status: 200,
      msg: "登录成功！",
    });
  }
});

//查询旅行分类列表
app.get("/api/productCollections", (req, res) => {
  let appData = require("./DbData/category.json");
  let result = appData.data;

  return res.json(result);
});

// 查询详情页数据
app.get("/api/touristRoutes/:detailId", (req, res) => {
  let appData = require("./DbData/detail.json");
  detailId = req.params.detailId;
  let result =
    appData[detailId] != null ? appData[detailId] : "无此旅游线路数据";

  return res.json(result);
});

// 搜索旅游线路
app.get("/api/touristRoutes", (req, res) => {
  let searchData = require("./DbData/search.json");
  const pageNumber = req.query.pageNumber;
  const pageSize = req.query.pageSize;
  const keyword = req.query.keyword;

  // 没有查询关键词的情况
  if (!keyword) {
    return doPagination(pageNumber, pageSize, searchData, res);
  } else {
    console.log("search keyword ==>", keyword);
    //  let reg = /keyword/ // 注意这里的正则不能使用/keyword/,因为keyword会被识别为字符，而不是变量
    let reg = new RegExp(keyword); //这里应该使用new RegExp构造正则表达式

    const filterResult = searchData.filter((item) => reg.test(item.title));
    console.log("filter result===>", filterResult);

    doPagination(pageNumber, pageSize, filterResult, res);
  }
});

// 分页函数
function doPagination(pageNumber, pageSize, baseData, res) {
  if (baseData.length == 0) return res.json([]);

  pageNumber = parseInt(pageNumber);
  pageSize = parseInt(pageSize);

  let paginationInfo = {};
  let queryPageInfo = [];
  const baseUrl = "http://127.0.0.1:3600/api/TouristRoutes?";

  // 计算总页数
  const totalPages = Math.ceil(baseData.length / pageSize);

  // 计算起始索引和结束索引
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, baseData.length);

  // 使用 slice 方法截取当前页的数据
  queryPageInfo = baseData.slice(startIndex, endIndex);

  // 计算上一页和下一页
  const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

  const previousPageLink = prevPage
    ? `${baseUrl}?pageNumber=${prevPage}&pageSize=${pageSize}`
    : null;
  const nextPageLink = nextPage
    ? `${baseUrl}?pageNumber=${nextPage}&pageSize=${pageSize}`
    : null;

  paginationInfo = {
    previousPageLink,
    nextPageLink,
    totalCount: baseData.length,
    pageSize,
    currentPage: pageNumber,
    totalPages,
  };

  // 注意：这里paginationInfo需要使用JSON.stringify将JSON对象转化成JSON字符串,否则到了redux那边会出现JSON无法解析的问题
  res.header("x-pagination", JSON.stringify(paginationInfo));
  return res.json(queryPageInfo);
}

// 获取购物车列表
app.get("/api/shoppingCart", (req, res) => {
  const { username, err } = getUsernameFromHeader(req);
  if (err) {
    res.statusCode = 401;
    return res.json({ err });
  }

  let cartlist = require("./DbData/cartlist.json");

  if (!(username in cartlist)) {
    return res.json({
      shoppingCartItems: [],
      msg: "ok",
    });
  } else {
    return res.json({
      shoppingCartItems: cartlist[username].shoppingCartItems,
      msg: "ok",
    });
  }
});

// 添加购物车
app.post("/api/shoppingCart/items", (req, res) => {
  const { username, err } = getUsernameFromHeader(req);
  if (err) {
    res.statusCode = 401;
    return res.json({ err });
  }

  let cartlist = require("./DbData/cartlist.json");

  itemId = req.body.touristRouteId;
  console.log("itemid=>", itemId);

  let goodsData = require("./DbData/detail.json");
  goodItem = goodsData[itemId];

  let cartItem = {};
  cartItem.id = goodItem.id;
  cartItem.discountPresent = goodItem.discountPresent;
  cartItem.description = goodItem.description;
  cartItem.originalPrice = goodItem.originalPrice;
  cartItem.price = goodItem.price;
  cartItem.rating = goodItem.rating;
  cartItem.title = goodItem.title;
  cartItem.touristRoutePictures = goodItem.touristRoutePictures;
  cartItem.travelDays = goodItem.travelDays;
  cartItem.tripType = goodItem.tripType;
  cartItem.departureCity = goodItem.departureCity;

  // 购物车为空的情况
  if (!(username in cartlist)) {
    cartlist[username] = {};
    let list = (cartlist[username].shoppingCartItems = []);
    list.push(cartItem);
  }

  // 购物车不为空的情况
  let list = cartlist[username].shoppingCartItems;
  const filtersList = list.filter((item) => item.id == itemId);
  if (filtersList.length > 0) {
    res.statusCode = 400;
    return res.json({
      err: "同一旅游线路不能重复添加！",
    });
  }

  list.push(cartItem);

  updateDbJson("./DbData/cartlist.json", cartlist, res);
});

// 删除购物车
app.delete("/api/shoppingCart/items/:ids", (req, res) => {
  let cartlist = require("./DbData/cartlist.json");
  const { username, err } = getUsernameFromHeader(req);
  if (err) {
    res.statusCode = 401;
    return res.json({ err });
  }

  let ids = req.params.ids;
  let newIds = ids.replace(/\(|\)/g, "");
  newIds = newIds.split(",");
  console.log("newIds ===>", newIds);

  const list = cartlist[username].shoppingCartItems;
  for (const id of newIds) {
    // 注意因为这里是遍历数组时动态删除数组元素，所以必须使用反向循环，否则会有问题
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].id == id) {
        list.splice(i, 1);
        break;
      }
    }
    updateDbJson("./DbData/cartlist.json", cartlist, res);
  }
});

// 结算并清空购物车
app.post("/api/shoppingCart/checkout", (req, res) => {
  let cartlist = require("./DbData/cartlist.json");
  let orderDB = require("./DbData/orders.json");
  const { username, err } = getUsernameFromHeader(req);
  if (err) {
    res.statusCode = 401;
    return res.json({ err });
  }

  let cartData = cartlist[username].shoppingCartItems;
  const orderId = short.uuid();

  const orderItem = {
    id: orderId,
    orderItems: cartData,
    state: "Pending",
  };

  // 用户订单为空的情况
  if (!(username in orderDB)) {
    orderDB[username] = {};
    let list = (orderDB[username].orders = []);
    list.push(orderItem);
  } else {
    orderDB[username].orders.push(orderItem);
  }

  fs.writeFile("./DbData/orders.json", JSON.stringify(orderDB), (err) => {
    console.log("订单写入失败，错误为： ", err);
  });

  cartlist[username].shoppingCartItems = []; // 清空购物车
  // 注意： 清空购物车时，还行同时写入json文件，否则前端的购物车信息不会真正更新，页面刷新时又会获得旧的购物车信息
  fs.writeFile("./DbData/cartlist.json", JSON.stringify(cartlist), (err) => {
    console.log("购物车写入失败，错误为： ", err);
  });

  return res.json(orderItem);
});

// 完成支付订单：
app.post("/api/orders/placeOrder/:orderId", (req, res) => {
  let orderDB = require("./DbData/orders.json");
  const { username, err } = getUsernameFromHeader(req);
  if (err) {
    res.statusCode = 401;
    return res.json({ err });
  }

  const orderId = req.params.orderId;
  const orderList = orderDB[username].orders;
  filterOrder = orderList.filter((item) => item.id == orderId);
  filterOrder[0].state = "Completed"; // 更改订单状态

  updateDbJson("./DbData/orders.json", orderDB, res);
});

//拦截404错误(在匹配前面所有已定义的路由以后，再拦截404)
app.get("*", function (req, res) {
  res.json({
    status: 404,
    message: "无此访问路径",
  });
});

function getUsernameFromHeader(req) {
  let username = "";
  let err = "";
  // 此函数内部包括了用户身份校验
  let Authorization = req.headers["authorization"]; // 此处authorization必须小写,否则会获取不到值报undifined
  //  console.log("Authorization==>", Authorization);
  if (!Authorization) err = "Token信息不存在,用户身份不合法！";

  const token_string = Authorization.split(" ")[1];
  const userInfo = jwt_decode(token_string);
  username = userInfo.username;

  let userData = require("./DbData/user.json").users;
  if (!userData[username]) {
    username = null;
    err = "无此用户信息，用户身份不合法！";
  } else if (userData[username].token != token_string) {
    username = null;
    err = "用户token信息无效，用户身份不合法！请重新登录";
  }

  return { username, err };
}

function updateDbJson(file, data, res) {
  fs.writeFile(file, JSON.stringify(data), (err) => {
    if (err) {
      return res.json({
        err: 500,
        message: "提交失败！错误是 " + err,
      });
    }

    res.statusCode = 200;
    return res.json({
      status: 200,
      success: 0,
      msg: "提交成功",
    });
  });
}

var port = 3600;
app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Listening on http://localhost:" + port + "\n");
});
