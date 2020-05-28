const DB = require("../../db/db-mongoose")
const https =require("https")


module.exports={
    wxLogin: async (ctx) =>{
        /**
         * @待定
         * */
        let {code} = ctx.request.body
        https.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx42274c6c6ba96f10&secret=dd79605cf09f5bb54aeaf1fdd3fbec5d&js_code=${code}&grant_type=authorization_code`,(res)=>{
            var content =''
            res.setEncoding('utf-8')
            res.on('data',(chunk) => {
                content += chunk
            }) 
            res.on('end',()=>{
                console.log("返回结果",content.toString());
                let wxRes = content.toString()
                let {appid,session_key} = wxRes 
            })
        })
        ctx.body={
            code:0,
            result:{
                token:"121291090"
            }
        }
    },
    getUserInfo: async (ctx) =>{
        ctx.body={
            code:0,
        }
    },
    
}