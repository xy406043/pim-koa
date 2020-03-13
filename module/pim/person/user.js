// const DB = require("../../db/db-mongodb");
const DB = require("../../db/db-mongoose");
const app = require("../../../config/config");
const jwt = require("jsonwebtoken");
const redis = require("koa-redis");

const nodemailer = require("nodemailer");
const Crypto = require("../../../libs/crypoto");
//新建Redis客户端
// const store =redis().client;
// console.log(store)
module.exports = {
  login: async function(ctx, next) {
    /**
     * 登录部分，第一次登录返回token
     * 携带登录返回则
     */
    const { userName, password } = ctx.request.body;

    let DB_res = await DB.findOne("users", { userName });
    let result;
    if (DB_res.code === 0) {
      result = DB_res.result;
    } else {
      ctx.body = {
        code: 99999,
        errMsg: DB_res.err
      };
      return;
    }
    if (result === null) {
      ctx.body = {
        code: 10011,
        errMsg: "无此账户"
      };
      return;
    }
    let _id = result["_id"];
    let access = result["access"];
    let pwd = result["password"];
    if (_id !== undefined && Crypto.decode(password) !== pwd) {
      ctx.body = {
        code: 10012,
        errMsg: "密码错误，请重新尝试"
      };
      return;
    }

    let payload = {
      userName: userName,
      id: _id
    };
    let secret = "PimToken";

    const token = jwt.sign(payload, secret, { expiresIn: "1000h" });
    await DB.updateOne("users", { userName }, { token });
    ctx.body = {
      code: 0,
      result: {
        id: _id,
        token: token,
        access: access
      }
    };
  },
  getUserInfo: async function(ctx, next) {
    // let PimToken = ctx.query.token;
    // let DB_res = await DB.findOne("users", { token: PimToken });
    let DB_res=await DB.findById("users",ctx.user.user_id)
    let result = DB_res.result;
    if (result) {
      console.log("getUSerInfo成功");
      ctx.body = {
        code: 0,
        result: {
          avatar: result.avatar,
          nickName: result.nickName,
          phone: result.phone,
          email: result.email,
          access: result.access,
          colorTheme: result.colorTheme,
          backgroundUrl: result.backgroundUrl
        }
      };
    } else {
      console.log("nowResult",result)
      ctx.body = {
        code: -1,
        errorMsg: "未知错误"
      };
    }
  },
  /**
   * @验证邮箱
   * TODO:
   * @这边的状态保存存在比较大的问题
   * @如何区分同时请求的不同用户
   */
  sendCode: async ctx => {
    let { userName, email } = ctx.request.body;
    //验证是不是一分钟内
    let saveExpire;
    const verify = (await DB.findOne("verify", { email: email })).result;
    if (verify === null) {
      saveExpire = 0;
    } else {
      saveExpire = verify.expire;
    }
    console.log("请求到期时间", saveExpire);
    if (saveExpire && new Date().getTime() - saveExpire < 0) {
      ctx.body = {
        code: -1,
        errorMsg: "验证请求过于频繁，1分钟内1次"
      };
      return false;
    }
    //发送端信息
    let transporter = nodemailer.createTransport({
      service: "qq",
      secureConnection: true, // 使用了 SSL
      host: "smtp.qq.com",
      port: 465,
      secure: true,
      auth: {
        user: app.smtp.user,
        pass: app.smtp.pass
      }
    });
    //接受端信息
    let ko = {
      code: app.smtp.code(),
      expire: app.smtp.expire(),
      email,
      user: userName
    };
    //邮件信息
    let mailOptions = {
      from: `个人信息管理系统 <${app.smtp.user}>`,
      to: ko.email,
      subject: "个人信息管理系统验证码",
      html: `${ko.user}您好，您正在 个人信息管理系统 注册 的验证码是：${ko.code}`
    };
    //发送邮件
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("veri", verify);
      if (verify === null) {
        await DB.insert("verify", {
          email: email,
          code: ko.code,
          expire: ko.expire
        });
      } else {
        await DB.updateOne(
          "verify",
          { email },
          {
            code: ko.code,
            expire: ko.expire
          }
        );
      }
    });
    //ctx返回值
    ctx.body = {
      code: 0,
      result: "验证码发送成功"
    };
  },
  /**
   * @注册账号一体化
   */
  register: async function(ctx, next) {
    const { code, email, userName, password } = ctx.request.body;
    const verify = (await DB.findOne("verify", { email: email })).result;
    console.log("词条查找", verify);
    if (verify === null) {
      ctx.body = {
        code: -1,
        errorMsg: "该邮箱尚未发送验证码"
      };
      return;
    }
    //校验code
    if (code) {
      const saveCode = verify.code;
      const saveExpire = verify.expire;
      console.log("保存状态", saveCode, saveExpire);
      if (code === saveCode) {
        if (new Date().getTime() - saveExpire > 60 * 60 * 1000) {
          ctx.body = {
            code: -1,
            errorMsg: "验证码已过期，请重新尝试"
          };
          return false;
        }
      } else {
        ctx.body = {
          code: -1,
          errorMsg: "请填写正确的验证码"
        };
        return false;
      }
    } else {
      ctx.body = {
        code: -1,
        errorMsg: "请填写验证码"
      };
      return false;
    }
    //检查userName是否存在于数据库中
    const isZai = (await DB.findOne("users", { userName: userName })).result;
    if (isZai) {
      ctx.body = {
        code: -1,
        errorMsg: "该用户名已存在"
      };
      return;
    }
    //不存在，存入数据库
    await DB.insert("users", {
      userName,
      email,
      password: Crypto.decode(password)
    });
    ctx.body = {
      code: 0,
      result: "注册成功"
    };
  },
  editUserInfo: async (ctx, next) => {
    let id = ctx.user.user_id;
    let p = ctx.request.body;
    await DB.findByIdAndUpdate("users", id, p);
    ctx.body = {
      code: 0,
      result: ""
    };
  }
};
