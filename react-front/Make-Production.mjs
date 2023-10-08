import * as esbuild from "esbuild";
import { lessLoader } from "esbuild-plugin-less";






import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

 let start = performance.now();



const config = {
  entryPoints: ["./src/index.tsx"], // 指定入口文件
  bundle: true, // 捆绑成一个输出文件
  outdir: "./build", // 输出文件的目录
  minify: true, // 不压缩代码（开发环境通常不需要压缩）
  metafile: true,
  loader: {
    ".css": "css", // 处理 CSS 文件
    ".module.css": "local-css", // 处理 .module.css模块文件
    ".png": "file", // 处理 PNG 图片文件
    ".jpg": "file", // 处理 JPG 图片文件
    ".jpeg": "file", // 处理 JPEG 图片文件
    ".gif": "file", // 处理 GIF 图片文件
    ".svg": "file", // 处理 SVG 图片文件
  },
  alias: {
    // 配置路径别名
    "@": path.resolve(__dirname, "./src"),
  },
  plugins: [lessLoader()],
};



esbuild.build(config).then(() => {
  let end = performance.now();
  console.log(`production build finishded, cost time: ${end - start}ms`);
});


