import * as esbuild from "esbuild";
import { lessLoader } from "esbuild-plugin-less";
import cssModulesPlugin  from "esbuild-plugin-css-modules";
import babel from "esbuild-plugin-babel";
import htmlPlugin from "@chialab/esbuild-plugin-html";


import  alias from "esbuild-plugin-alias";


import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = 7002;



const config = {
  entryPoints: ["./src/index.tsx"], // 指定入口文件
  bundle: true, // 捆绑成一个输出文件
  outdir: "./public/build", // 输出文件的目录
  define: {
    "process.env.NODE_ENV": '"development"', // 设置环境变量为开发环境
  },
  minify: false, // 不压缩代码（开发环境通常不需要压缩）
  // splitting: true, // 启用代码拆分
  loader: {
    ".ts": "ts", // 处理 TypeScript 文件
    ".tsx": "tsx", // 处理 TypeScript JSX 文件
    ".js": "jsx", // 处理 JSX 文件
    ".css": "css", // 处理 CSS 文件
    ".png": "file", // 处理 PNG 图片文件
    ".jpg": "file", // 处理 JPG 图片文件
    ".jpeg": "file", // 处理 JPEG 图片文件
    ".gif": "file", // 处理 GIF 图片文件
    ".svg": "file", // 处理 SVG 图片文件
  },
  plugins: [
    // babel(),
    cssModulesPlugin(),
    lessLoader(),
    htmlPlugin(),
    alias({
      // 配置路径别名
      "@": path.resolve(__dirname, "./src"),
    }),
  ],
};

// 这里await不能少，否则会报错： context.serve is not a function， 因为它返回的是一个promise对象
const context = await esbuild.context(config); 
context
  .serve({
    servedir: "public", // 指定静态文件目录，例如 public 目录
    port, // 指定服务器端口
  })
  .then(() => {
    console.log(`Development server is running on http://localhost:${port}`);
  })
  .catch((err) => {
    console.log("error ==>", err)
    process.exit(1);
  });;
