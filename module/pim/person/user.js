// const DB = require("../../db/db-mongodb");
const DB = require("../../db/db-mongoose")
const jwt = require("jsonwebtoken");
const Crypto =require("../../../libs/crypoto")

module.exports = {
  login: async function(ctx, next) {
    /**
     * 登录部分，第一次登录返回token
     * 携带登录返回则
     */
    const { userName, password } = ctx.request.body;
    let result = await DB.findOne("users", { userName });
    if(result===null){
      ctx.body={
        code:10011,
        errMsg:"无此账户"
      }
      return
    }
    let _id = result["_id"];
    let access =result['access']
    let pwd = result['password']
    if(_id!==undefined && Crypto.decode(password)!==pwd){
      ctx.body={
        code:10012,
        errMsg:"密码错误，请重新尝试"
      }
      return
    }

    let payload ={
      username: userName,
      id: _id
    }
    let secret  ="PimToken"
    
    const token = jwt.sign(
       payload,
       secret,
      { expiresIn: "10h" }
    );
    await DB.updateOne("users",{userName},{token})
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
    let result = await DB.findOne("users",{token:PimToken})
     if(result.length===0){
       ctx.body={
         code:90002,
         errMsg:"token错误"
       }
       return
     }
    ctx.body={
      code:0,
      result:{
        avatar: result.avatar,
        nickName: result.nickName,
        email: result.email,
        access:result.access,
        colorTheme: result.colorTheme,
        backgroundUrl: result.backgroundUrl
      }
    }
  },
  register: async function(ctx, next) {
    let result =await DB.find("users",{userName:'xy'})
    // console.log(result)
    ctx.body="sja"
  },
  editUserInfo: async (ctx, next) => {}
};
