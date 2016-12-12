//检查node，npm版本
require('./check-versions')()
// 引入config文件
var config = require('../config')
// 如果没有指定开发环境，就用配置文件里的dev的环境development
if (!process.env.NODE_ENV) process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
//path模块  
var path = require('path')
// express模块
var express = require('express')
// webpack模块，后面compiler神马的要用到
var webpack = require('webpack')
// opn模块，可以强制打开当前默认浏览器，只要传入url
var opn = require('opn')
// 代理后台api 
var proxyMiddleware = require('http-proxy-middleware')
//根据环境，导入不同的webpack配置，test: prod   否则：dev
var webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
// 使用指定的端口，或者dev配置文件的端口8080
var port = process.env.PORT || config.dev.port
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
// 代理表
var proxyTable = config.dev.proxyTable
// 使用express
var app = express()
// webpack的工作方式，导入配置文件，生成compiler，然后才能使用plugin插件
var compiler = webpack(webpackConfig)
// 生成的文件暂存到内存
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
})
// 热加载插件
var hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
// express使用内存中暂存的编辑后的文件
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
// express使用热加载插件
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  var uri = 'http://localhost:' + port
  console.log('Listening at ' + uri + '\n')

  // when env is testing, don't need open it
  if (process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
})
