const DB = require("../db/db");
const jwt = require("jsonwebtoken");
const Crypto =require("../../libs/crypoto")



module.exports = {
  login: async function(ctx, next) {
    /**
     * 登录部分，第一次登录返回token
     * 携带登录返回则
     */
    const { userName, password } = ctx.request.body;
    
    let ld = await DB.find("user", { userName });
    console.log(ld)
    if(ld===[]||ld.length===0){
      console.log("可以")
      ctx.body={
        code:10001,
        errMsg:"无此账户"
      }
      return
    }

    let _id = ld[0]["_id"];
    let access =ld[0]['access']
    let pwd = ld[0]['password']
    if(_id!==undefined && Crypto.decode(password)!==pwd){
      ctx.body={
        code:10002,
        errMsg:"密码错误，请重新尝试"
      }
      return
    }
    
    // if()
    const token = jwt.sign(
      {
        username: userName,
        id: _id
      },
      "PimToken",
      { expiresIn: "9" }
    );
    await DB.update("user",{userName},{token})
    ctx.body = {
      code: 0,
      result: {
        id:_id,
        token: token,
        access: access
      }
    };
  },
  getUserInfo: async function(ctx, next) {
    let PimToken = ctx.query.token
    let ld = await DB.find("user",{token:PimToken})
     if(ld.length===0){
       ctx.body={
         code:10010,
         errMsg:"token错误"
       }
       return
     }
    ctx.body={
      code:0,
      result:{
        avatar: ld[0].avatar,
        nickName: ld[0].nickName,
        email: ld[0].email,
        access:ld[0].access,
        colorTheme: ld[0].colorTheme,
        backgroundUrl: ld[0].backgroundUrl
      }
    }
  },
  register: async function(ctx, next) {
    let ld =await DB.find("user",{userName:'xy'})
    console.log(ld)
    ctx.body="sja"
  },
  editUserInfo: async (ctx, next) => {}
};
