const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, dir)
}
// vue.config.js
module.exports = {
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // 多入口配置
  // pages: {
  //   index: {
  //     entry: 'src/main.js',
  //     template: 'public/index.html',
  //     filename: 'index.html',
  //   }
  // },
  // 打包app时放开该配置
  // publicPath:'./',
  configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))

    /**
     * @Date: 2021-07-15 15:08:25
     * @Author: 陈乾龙
     * @description: 全局静态参数配置
     */
    const oneOfsMap = config.module.rule('less').oneOfs.store
    oneOfsMap.forEach(item => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          // 这里填入你的样式文件地址
          resources: './src/assets/less/common_variable.less'
        })
        .end()
    })
    // 生产环境，开启js\css压缩
    if (process.env.NODE_ENV === 'production') {
      config.plugin('compressionPlugin').use(new CompressionPlugin({
        test: /\.(js|css|less)$/, // 匹配文件名
        threshold: 10240, // 对超过10k的数据压缩
        deleteOriginalAssets: false // 不删除源文件
      }))
    }

    config.plugin('provide').use(webpack.ProvidePlugin, [{
      // other modules
      introJs: ['intro.js']
    }])

    // 配置 webpack 识别 markdown 为普通的文件
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use()
      .loader('file-loader')
      .end()

    // 编译vxe-table包里的es6代码，解决IE11兼容问题
    config.module
      .rule('vxe')
      .test(/\.js$/)
      .include
      .add(resolve('node_modules/vxe-table'))
      .add(resolve('node_modules/vxe-table-plugin-antd'))
      .end()
      .use()
      .loader('babel-loader')
      .end()
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          // 'primary-color': '#1890FF',
          'primary-color': '#409EFF',
          // 'link-color': '#1890FF',
          'link-color': '#409EFF',
          'border-radius-base': '3px',
          // 'border-radius-base': '4px',
        },
        javascriptEnabled: true,
      }
    },
  },

  devServer: {
    port: 3000,
    proxy: {
      /** '/api': {
         target: 'https://mock.ihx.me/mock/5baf3052f7da7e07e04a5116/antd-pro', //mock API接口系统
         ws: false,
         changeOrigin: true,
         pathRewrite: {
           '/jeecg-boot': ''  //默认所有请求都加了jeecg-boot前缀，需要去掉
         }
       },**/
      '/jeecg-boot': {
        target: 'http://192.168.3.71:9998', // 请求本地 需要jeecg-boot后台项目
        ws: false,
        changeOrigin: true
      },
    }
  },
  lintOnSave: false
}