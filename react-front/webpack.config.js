var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");
var path = require("path");
const port = 7002;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");

const packOptions = [
  new BundleAnalyzerPlugin({
    analyzerMode: "server",
    analyzerHost: "127.0.0.1",
    analyzerPort: 8888,
    openAnalyzer: false, // 构建分析完成后是否打开浏览器
    reportFilename: path.resolve(__dirname, `analyzer/index.html`),
  }),
  new CompressionWebpackPlugin({
    test: /\.(css|js|ts|tsx)$/,
    // 只处理比1kb大的资源
    threshold: 1024 * 1,
    // 只处理压缩率低于90%的文件
    minRatio: 0.9,
    deleteOriginalAssets: true,
  }),
  new AntdDayjsWebpackPlugin(), // 移除moment.js替换为dayjs作为日期组件

  // 只保留中英两种语言，减少moment语言的体积
  new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb|zh-cn/),
  // 利用MiniCssExtractPlugin抽离css/less并指定打包后的存储路径
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: "css/[name].[contenthash:8].css",
    chunkFilename: "css/[name].[contenthash:8].chunk.css",
  }),
];

const DevOptions = [  
  new CompressionWebpackPlugin({
    test: /\.(css|js|ts|tsx)$/,
    // 只处理比1kb大的资源
    threshold: 1024 * 1,
    // 只处理压缩率低于90%的文件
    minRatio: 0.9,
  }),
  new AntdDayjsWebpackPlugin(), // 移除moment.js替换为dayjs作为日期组件

  // 只保留中英两种语言，减少moment语言的体积
  new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en-gb|zh-cn/),
  // 利用MiniCssExtractPlugin抽离css/less并指定打包后的存储路径
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: "css/[name].[contenthash:8].css",
    chunkFilename: "css/[name].[contenthash:8].chunk.css",
  }),
];

module.exports = {
  mode: "development",
  context: path.join(__dirname, "./src"),
  devtool: debug ? "eval-cheap-source-map" : false,
  // devtool: debug ? "eval-cheap-module-source-map" : false,
  entry: {main: "./index.tsx"}, //这里必须以./开头，否则会报错：Requests that should resolve in the current directory need to start with './'.
  devServer: {
    //contentBase是解决webpack开发模式找不到css样式文件的关键点
    static: {
      directory: path.join(__dirname, "public"), //webpack5中contentBase被static替代了
    },
    // contentBase: path.join(__dirname, "./public"),
    historyApiFallback: true,
    hot: true,
    port: port,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3600",

        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:3600",
        changeOrigin: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          // options: {
          //   presets: ["@babel/preset-react"],
          //   plugins: [["import", { libraryName: "antd", style: true }]],
          // },
        },
      },
      // 下面是使用 ant-design 的配置文件
      // 利用MiniCssExtractPlugin讲css,less等样式文件从打包js文件中抽离出来

      // 利用MiniCssExtractPlugin讲css,less等样式文件从打包js文件中抽离出来
      { test: /\.(css)$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      // 注意：这里style-loader必须要有，否则会无法加载样式，页面排版混乱
      // { test: /\.(css)$/, use: ["style-loader", "css-loader"] },
      // {
      //   test: /\.less$/,
      //   use: [
      //     {
      //       loader: "style-loader",
      //     },
      //     {
      //       loader: "css-loader",
      //     },
      //     {
      //       loader: "less-loader",
      //       options: {
      //         lessOptions: {
      //           javascriptEnabled: true,
      //         },
      //       },
      //     },
      //   ],
      // },

      {
        test: /\.(png|jpg|gif)$/i,
        use: {
          loader: "url-loader",
          options: {
            name: "[name]_[hash].[ext]",
            limit: 8192, //limit表示小于该值的图片以base64打包进js文件，超过则在打包时生成图片文件
            outputPath: "imgs/", //imgs后面的斜杠不能少，否则不会生成该二级目录
          },
        },
      },
    ],
  },
  output: {
    publicPath: "/",
    // publicPath: "/test/", //publicPath本质上是：静态资源引用路径的前缀对项目编译后文件的物理存储位置的映射
    path: path.resolve(__dirname, "./dist"),
    filename: "js/[name].js",
    chunkFilename: "js/[name].[contenthash].js",
  },

  externals: [
    {
      express: { commonjs: "express" },
    },
  ],

  resolve: {
    // 注意这里后缀名必须带点，比如：.tsx，否则会报错：Module not found: Error: Can't resolve XXX
    extensions: ["", ".jsx", ".ts", ".tsx", ".js", ".jpg", ".png", ".gif"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    fallback: {
      fs: false,
      http2: false,
      net: false,
      tls: false,
      child_process: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      path: false,
      buffer: false,
      util: false,
      zlib: false,
      vm: false,
      os: false,
      constants: false,
      assert: false,
      tty: false,
    },
  },
  plugins: debug
    ? [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, "./public/index.html"),
          filename: "index.html",
          inject: true, //true表示生成html时插入js/css代码，这个HtmlWebpackPlugin配置是开发环境下显示页面内容的关键！
        }),

        // ...packOptions,

        // 解决报错：URIError: Failed to decode param '/%PUBLIC_URL%/favicon.ico
        new InterpolateHtmlPlugin({
          PUBLIC_URL: "./",
        }),
        ...DevOptions,
      ]
    : [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, "./public/index.html"),
          filename: "index.html",
        }),

        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist")],
        }), //每次构建自动删除dist目录

        ...packOptions,
      ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // 使用TerserPlugin压缩可以移除antd
        terserOptions: {
          compress: {
            arguments: true,
            dead_code: true,
          },
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true,
          format: {
            comments: false, // 自动清除打包后生成的LICSENCE文件 ，此项必须有！
          },
        },
        extractComments: false, // 自动清除打包后生成的LICSENCE文件
      }),
    ],

    splitChunks: {
      minSize: 10 * 1024, // 超过10K分包
      maxSize: 100 * 1024, // 分包最大30K超出再分包
      cacheGroups: {
        reactBase: {
          test: (module) => {
            return /react|redux|prop-types/.test(module.context);
          }, // 直接使用 test 来做路径匹配，抽离react相关代码
          chunks: "initial",
          name: "reactBase",
          priority: 10,
        },
        // "antd-vendor": {
        //   test: (module) => /antd?/.test(module.context),
        //   priority: 2,
        //   reuseExistingChunk: true,
        //   name: "antd",
        // },
        components: {
          test: /[\\/]components[\\/]/,
          name: "components",
          priority: 8,
          chunks: "all",
        },
        pages: {
          test: /[\\/]pages[\\/]/,
          name: "pages",
          priority: 8,
          chunks: "all",
        },

        antd: {
          test: /[\\/]node_modules[\\/](antd)[\\/]/,
          name: "antd",
          priority: 10,
          chunks: "initial",
        },
        reactDom: {
          test: /[\\/]node_modules[\\/](react-dom)[\\/]/,
          name: "reactDom",
          priority: 10,
          chunks: "initial",
        },

        vendors: {
          name: "chunk-vendors", // 优先级小于output.filename
          test: /[\\/]node_modules[\\/]/,
          chunks: "initial",
          priority: -10,
          reuseExistingChunk: true,
          // enforce: true  // 这里不能加此项，否则vendor-chunk不能打包成功
        },
      },
    },
  },
};
