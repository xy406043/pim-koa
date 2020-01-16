const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
// const router = require('koa-router')()
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const index = require("./routes/index");
const cors = require("koa2-cors");

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));


/***
 * 位置因素，应该是不能放在error之后，在这就可以
 * 注意Access-Control—Allow-Headers里面，在此项目中携带tok嗯，因此Authorization是必须的！！！
 */
app.use(
  async (ctx,next) => {
    // let origin = ctx.url
   ctx.set("Access-Control-Allow-Origin", "*");
   ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
   ctx.set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
   ctx.set("Content-Type", "application/json;charset=utf-8");
   ctx.set("Access-Control-Max-Age","300")
   ctx.set("Access-Control-Allow-Credentials",true)
   if(ctx.method==='OPTIONS'){
     ctx.body = '';
     ctx.status = 200;
   }else{
    await  next()
   }
  //  await next()
  }
);

/**
 * 模板引擎
 * 前端用的Vue，这里就不管了
 */
// app.use(views(__dirname + '/views', {
//   extension: 'ejs'                // 这种后缀名必须是ejs
// }))
app.use(views("views"), { map: { html: "ejs" } }); //这种必须是HTML
// 监听端口号

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  // console.log("具体", ctx.request);
});

/**
 * routes启动路由               根据ctx.status设置response响应头
 * 路由匹配 app.use => router.routes =>router.use => router.router
 * 注意！！！！      / 路由斜杠千万不能多写！！！！！！
 * */
// console.log(index)
app.use(index.routes(), index.allowedMethods());
// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});



module.exports = app;

/**
 *  之后要做的事
 * 学会异步
 * 小型爬虫
 * 连接数据库
 * 写接口    接口文档  具体的数据库操作
 * Vue实现具体功能!
 * cookie保存用户信息
 *
 *
 *  */
