
const DB = require("../../db/db-mongoose");
const Crypto = require("../../../libs/crypoto");
module.exports ={
    getSecondCode: async  (ctx,next) =>{
        let id =ctx.user.user_id
        let result =(await DB.findById("users",id)).result
        ctx.body={
            code:0,
            result:{
                sCode:result.secondCode?true:false
            }
        }
    },
    addSecondCode:async   (ctx,next) =>{
       let pass =ctx.request.body.password
       console.log(pass)
       let user_id =ctx.user.user_id
       await DB.findByIdAndUpdate("users",user_id,{secondCode:Crypto.decode(pass)})
       ctx.body={
           code:0,
           result:""
       }
    },
    verifyCode: async  (ctx,next) =>{
        let pass =ctx.request.body.password
        let user_id =ctx.user.user_id
        let result =(await DB.findById("users",user_id)).result
        console.log(Crypto.decode(pass))
        if(Crypto.decode(pass)!==result.secondCode){
           ctx.body={
               code:-1,
               errMsg:"密码错误"
           }
           return
        }
        ctx.body={
            code:0,
            result:"校验成功"
        }

    }
    
}