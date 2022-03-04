const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";
module.exports = {
  // 入口
  entry: "./src/index.js",
  // 出口
  output: {
    path: path.resolve(__dirname, "dist"), //必须是绝对路径
    // filename: "index.js",
    filename: "js/[name].js",
    publicPath: "/", //通常是CDN地址
  },
  // 模块寻找方式 文章 => https://www.cnblogs.com/joyco773/p/9049760.html
  resolve: {
    // 第三方模块目录 从左到右依次查找
    modules: ["./src/components", "node_modules"],
    // 目录别名
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // 是否强制需要文件名后缀
    enforceExtension: false,
    // 自动带后缀
    extensions: [".js", ".less", ".json"],
  },
  // 编译模式 development / production
  // process.env.NODE_ENV === mode
  mode: process.env.NODE_ENV,
  // 配置本地开发环境 文档 => https://www.webpackjs.com/configuration/dev-server/
  devServer: {
    // 端口号 默认8080
    port: "3000",
    // 日志配置
    client: {
      // 日志登记
      logging: "info",
      // 全屏显示日志
      overlay: {
        errors: true,
        warnings: false,
      },
      // 打印编译进度
      progress: false,
      // 重新连接客户端 boolean => 是否重连 number => 重连次数
      reconnect: 5,
    },
    // 热更新
    hot: true,
    // 是否启用gzip压缩
    compress: true,
    https: true,
  },
  // 打包模式 => https://webpack.docschina.org/configuration/devtool/#development
  // 不同的值会明显影响到构建和重新构建的速度
  devtool: isDev ? "eval-cheap-module-source-map" : "source-map",
  // modle中的每一个规则决定了如何处理项目中的不同类型模块
  // loader 用来匹配处理某一个特定的模块 将接收到的内容进行转换后返回 充当文件转换器的角色
  // loader的执行顺序 从下到上 从右到左
  module: {
    rules: [
      // ES6转ESS5
      {
        // 匹配规则
        test: /\.jsx?$/,
        // 用来处理命中规则的库
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: 3,
                  },
                ],
              ],
            },
          },
          // 自定义组件 给console添加内容
          {
            loader: path.resolve(
              __dirname,
              "public",
              "webpack",
              "logWebpackLoader.js"
            ),
            options: {
              log: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // 处理样式文件
      // 遵循从下到上规则执行
      // less-loader => postcss-loader => css-loader > MiniCssExtractPlugin
      {
        test: /\.(le|c)ss$/,
        use: [
          // 加载css
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          // 处理@import等语句
          {
            loader: "css-loader",
            options: {
              // 使用 import { fooBaz, bar } from .. 形式引入css
              modules: false,
              // 是否生成map文件
              sourceMap: false,
              importLoaders: 1,
            },
          },
          // 添加浏览器前缀 配置文件在package.json
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
          // 编译less为css
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              lessOptions: {
                strictMath: true,
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      // 处理图片资源
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              outputPath: "assets/",
              // 10K以下文件会自动转base64
              limit: 10240,
              // 允许require形式引入图片
              esModule: false,
              name: "[name]_[hash:6].[ext]",
            },
          },
        ],
        exclude: /node_modules/,
      },
      // 处理html中的图片地址
      // 这会导致ejs模板失效 <%= %> 将无法使用
      // 可以在模板文件中使用require方式引入图片
      // {
      //   test: /.html$/,
      //   use: "html-withimg-loader",
      // },
    ],
  },
  // 优化模块 文章 => https://segmentfault.com/a/1190000017066322
  optimization: {
    // 是否开启代码压缩
    minimize: true,
    // 编译错误时是否生成资源
    noEmitOnErrors: true,
    // 手动指定代码压缩库 默认使用 uglifyjs-webpack-plugin
    minimizer: [
      // css压缩
      new CssMinimizerPlugin(),
    ],
  },
  // 插件
  // plugin 不直接操作文件 基于事件流框架Tapable实现 通过钩子可以涉及到webpack的事件流程 通过监听生命周期钩子在合适的时机使用webpack提供的API做一些事情
  plugins: [
    // 热更新
    new webpack.HotModuleReplacementPlugin(),
    // css压缩
    new MiniCssExtractPlugin(),
    // 每次打包前清空dist目录
    new CleanWebpackPlugin({
      // 不用删除的文件列表
      cleanOnceBeforeBuildPatterns: [],
    }),
    // 处理html文件
    new HtmlWebpackPlugin({
      // 模板文件
      template: "./public/index.html",
      //打包后的文件名
      filename: "index.html",
      // 压缩配置 文档 => https://github.com/kangax/html-minifier#user-content-options-quick-reference
      minify: {
        // 是否删除属性的双引号
        removeAttributeQuotes: false,
        // 是否去除空格
        collapseWhitespace: true,
        // 保留单例元素的末尾斜杠。
        keepClosingSlash: false,
        // 是否删除注释
        removeComments: true,
        // 是否大小写敏感
        caseSensitive: false,
      },
      // 配置文件
      config: {
        title: isDev ? "dev title" : "prod title",
      },
      // 是否加上hash
      hash: true,
    }),
    // 处理css文件
    // 文档 => https://webpack.docschina.org/plugins/mini-css-extract-plugin/
    new MiniCssExtractPlugin({
      // 设定输出目录到css目录下 这里需要在loader配置将上下文修改为上一级目录
      filename: "css/[name].[contenthash].css",
      // 禁用css order警告
      ignoreOrder: false,
    }),
    // 复制指定文件到dist目录
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "*.js",
          to: path.resolve(__dirname, "dist", "lib"),
          // from目录的上下文 如果不配置这个 dist目录会把pubilc一起带过去变为dist/public/lib/...
          context: "./public/lib/",
          globOptions: {
            // 是否复制隐藏文件 .开头
            dot: true,
            // 是否使用git配置的忽略文件
            gitignore: true,
            // 忽略路径
            ignore: ["**/ignore/**"],
          },
          // 覆盖已存在的文件
          force: true,
        },
      ],
      // 文档 => https://webpack.js.org/plugins/copy-webpack-plugin/#options
      options: {
        // 并发
        concurrency: 100,
      },
    }),
    // 添加全局变量
    new webpack.ProvidePlugin({
      _: ["lodash"],
    }),
  ],
};
