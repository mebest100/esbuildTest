import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const history = require("connect-history-api-fallback");
const app = express();

// const expressStaticGzip = require("express-static-gzip");

// // 配置 express-static-gzip 中间件来提供 gzip 格式的静态资源文件
// app.use(
//   "/",
//   expressStaticGzip("./dist", {
//     enableBrotli: true, // 如果你有 Brotli 压缩文件，可以启用它
//     customCompressions: [
//       {
//         encodingName: "gzip",
//         fileExtension: "gz", // 配置文件扩展名
//       },
//     ],
//   })
// );

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:3600",
    // 注意：如果在app之前使用了body-parser，那么就必须加上onProxyReq: fixRequestBody选项
    // 否则会无法处理post请求，无法解析post请求中的body
    // 如果没有添加body-parser依赖，则无需添加onProxyReq: fixRequestBody
    // onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      console.error(err);
      res.status(500).send("Proxy Error");
    },
  })
);
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:3600",
    // onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      console.error(err);
      res.status(500).send("Proxy Error");
    },
  })
);

app.use(history());
app.use(express.static("./public/build"));

const port = 9020;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Listening on http://localhost:" + port + "\n");
});
