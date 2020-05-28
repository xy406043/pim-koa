const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
// const router = require('koa-router')()
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
// const koaBody = require('koa-body');
const logger = require("koa-logger");
const index = require("./routes/index");
const { verifyToken } = require("./libs/token");
const socketJs = require("./module/pim/socket")
// const cors = require("koa2-cors");
// const history = require('./middleware/koa2-connect-history-api-fallback')
// app.use(history({
// verbose: true//打出转发日志
// }));
/**
 * @建立socket链接
 */
const server = require("http").Server(app.callback());
//挂载socket
const io = require("socket.io")(server);
//监听socket连接
server.listen(4000, () => {
  console.log("socket连接",4000);
});
io.on("connection", socket => {
  console.log("连接成功",{id:socket.id})
  //捕获客户端send信息
  //前端io.send(message)
  socket.on("notice", async (msg) =>{
    // console.log("任务通知",msg)
    setTimeout(()=>{
        let result =socketJs.sendTodoNotice(msg.value)
        result.then(res =>{
          if(res!==0){
            /**
             * @不为0发送消息让前端判断
             */
            io.sockets.connected[socket.id].emit('getTodoNotice',res) //指定发送
          }else{
            /**
             * @为0让前端继续维持链接
             */
            io.sockets.connected[socket.id].emit('getTodoNotice',0) //指定发送
          }
        }).catch(err =>{
          console.log("错误",err)
        })
    },7000)
  });

  //捕获客户端自定义信息
  //前端io.emit('xxx', message);
  socket.on("scheduleNotice", async (msg) =>{
      // socket.emit('user',msg.value) //广播
      setTimeout(()=>{
          let result =socketJs.sendNotice(msg.value)
          result.then(res =>{
            if(res!==0){
              /**
               * @不为0发送消息让前端判断
               */
              io.sockets.connected[socket.id].emit('getNotice',res) //指定发送
            }else{
              /**
               * @为0让前端继续维持链接
               */
              io.sockets.connected[socket.id].emit('getNotice',0) //指定发送
            }
          }).catch(err =>{
            console.log("错误",err)
          })
      },6000)
  });
  //监听客户端断开连接
  socket.on('disconnect', async  ()=> {
    console.log('连接已经关闭')
  })
  setTimeout(()=>{
    io.sockets.connected[socket.id].emit('getTodoNotice',0) //指定发送
    io.sockets.connected[socket.id].emit('getNotice',0) //指定发送
  },1000)

});

onerror(app);
// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
// app.use(koaBody({
//   multipart:true, // 支持文件上传
//   // encoding:'gzip',
//   // formidable:{
//   //   uploadDir:path.join(__dirname,'public/upload/'), // 设置文件上传目录
//   //   keepExtensions: true,    // 保持文件的后缀
//   //   maxFieldsSize:2 * 1024 * 1024, // 文件上传大小
//   //   onFileBegin:(name,file) => { // 文件上传前的设置
//   //     // console.log(`name: ${name}`);
//   //     // console.log(file);
//   //   },
//   // }
// }));
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public/dist"));

/***
 * 位置因素，应该是不能放在error之后，在这就可以
 * 注意Access-Control—Allow-Headers里面，在此项目中携带tok嗯，因此Authorization是必须的！！！
 */
app.use(async (ctx, next) => {
  // console.log(ctx.header)
  // let origin = ctx.url
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
  );
  ctx.set("Content-Type", "application/json;charset=utf-8");
  ctx.set("Access-Control-Max-Age", "300");
  ctx.set("Access-Control-Allow-Credentials", true);
  if (ctx.method === "OPTIONS") {
    ctx.body = {};
    ctx.status = 200;
  } else {
    await next();
  }
  //  await next()
});
/***
 * 中间件的执行顺序
 * 123321 ---
 */
app.use(async (ctx, next) => {
  await verifyToken(ctx, next); // !!! async await
  await next();
});
/**
 * 模板引擎
 * 前端用的Vue，这里就不管了
 */
// app.use(views(__dirname + '/views', {
//   extension: 'ejs'                // 这种后缀名必须是ejs
// }))
// app.use(views("views"), { map: { html: "ejs" } }); //这种必须是HTML
// 监听端口号
//app.listen(3000)

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
