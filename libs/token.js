const jwt = require("jsonwebtoken");
const User = require("./user");
let safeRoutes = [];

const verifyToken = async (ctx, next) => {
  // 解析不到token？？
  // console.log(ctx)
  // console.log(ctx.header)

  let token =   ctx.header.authorization;
  if (token) {
    try {
      let payload = await jwt.verify(token.split(" ")[1], "PimToken");
      let user = await User.CheckUser(payload); // 牢记异步
      if (user) {
        /**
         * ctx设置状态很重要
         */
        ctx.status = 200;
        /**
         * 下面的事件实际上已经把user添加到了上下文
         * 但是打印不出来
         * TODO:
         * @这边的状态保存存在比较大的问题
         * @如何区分同时请求的不同用户
         *  */
        ctx.user = {
          userName: payload.userName,
          user_id: payload.id
        };
        // error handler
        console.log("全局用户信息" ,ctx.user);
      } else {
        ctx.body = {
          code: 90003,
          errorMsg: "当前用户不存在"
        };
      }
    } catch (err) {
      console.log("错误补货",err)
      /**
       * 过期处理？？？
       */
      throw 403
      ctx.status = 200
    }
  }
};

module.exports = { verifyToken };
