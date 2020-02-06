const jwt = require("jsonwebtoken")
const User = require("./user")
let safeRoutes=[

]

const verifyToken = async (ctx,next) =>{
    // 解析不到token？？
    // console.log(ctx)
    let token = ctx.header.authorization;
    if(!!token ){
        try{
            let payload = await jwt.verify(token.split(' ')[1],'PimToken')
            let user = await  User.CheckUser(payload)      // 牢记异步
            if(user){
                /**
                 * ctx设置状态很重要
                 */
                ctx.status=200  
                /**
                 * 下面的事件实际上已经把user添加到了上下文
                 * 但是打印不出来
                 *  */   
                ctx.user={
                    userName:payload.username,
                    user_id:payload.id
                }
            }else{
                ctx.body={
                    code: 90003,
                    errorMsg:"当前用户不存在"
                }
            }
            
        }catch(err){
             /**
                 * 过期处理？？？
                 */
                // throw 401
            ctx.body={
                code: 90001,
                errorMsg:"登录无效"
            }
        }
    }


}

module.exports= {verifyToken}