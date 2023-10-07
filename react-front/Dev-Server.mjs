import * as esbuild from "esbuild";
import { lessLoader } from "esbuild-plugin-less";
import http from "node:http";
// import htmlPlugin from "@chialab/esbuild-plugin-html";




import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPort = 7002;



const config = {
  entryPoints: ["./src/index.tsx"], // 指定入口文件
  bundle: true, // 捆绑成一个输出文件
  outdir: "./public", // 输出文件的目录
  minify: false, // 不压缩代码（开发环境通常不需要压缩）  
  loader: { 
    ".css": "css", // 处理 CSS 文件
    ".png": "file", // 处理 PNG 图片文件
    ".jpg": "file", // 处理 JPG 图片文件
    ".jpeg": "file", // 处理 JPEG 图片文件
    ".gif": "file", // 处理 GIF 图片文件
    ".svg": "file", // 处理 SVG 图片文件
  },
   alias:{
      // 配置路径别名
      "@": path.resolve(__dirname, "./src"),
    },
  plugins: [    
    lessLoader(),
    // htmlPlugin(),   
  ],
};

// 这里await不能少，否则会报错： context.serve is not a function， 因为它返回的是一个promise对象
const context = await esbuild.context(config); 
 let { host, port } = await context.serve({
   servedir: "public", // 指定静态文件目录，例如 public 目录
 });
 host = "127.0.0.1";
 // 以下是反向代理转发api请求的部分
 http
   .createServer((req, res) => {
     let options = {};
     if (/\/api/.test(req.url) || /\/auth/.test(req.url)) {
       options = {
         hostname: host,
         port: 3600,
         path: req.url,
         method: req.method,
         headers: req.headers,
       };
     } else {
       options = {
         hostname: host,
         port: port,
         path: req.url,
         method: req.method,
         headers: req.headers,
       };
     }

     // 通过代理分发api请求/前端react页面请求
     const proxyReq = http.request(options, (proxyRes) => {
     
       if (proxyRes.statusCode === 404) {
         res.writeHead(404, { "Content-Type": "text/html" });
         res.end("<h1>A custom 404 page</h1>");
         return;
       }
    

       res.writeHead(proxyRes.statusCode, proxyRes.headers);
       proxyRes.pipe(res, { end: true }); // 把代理转发的响应结果传递给前端客户端
     }); 

     req.pipe(proxyReq, { end: true }); // 把入口转发的参数和payload转发给代理
   })
   .listen(serverPort, () => {
     console.log(`server is listening on port ${serverPort} `);
   });
   
