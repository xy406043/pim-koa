const DB = require("../../db/db-mongoose");
const Crypto = require("../../../libs/crypoto");

module.exports={
    getFileList: async ctx =>{
        let condition ={
            user_id:ctx.user.user_id
        }
        let options={}
        let result =(await DB.where("folder",condition,options)).result
        ctx.body={
            code:0,
            result:result
        }

    },
    addFile: async ctx =>{
         let {name,size,type,fileUrl} =ctx.request.body
         let p={
             user_id:ctx.user.user_id,
             name,
             size,
             type,
             fileUrl
         }
         let bo = (await DB.findOne("folder",{name:name})).result
         if(bo!==null){
             let folder_id=bo._id
             await DB.findByIdAndUpdate("folder",folder_id,{fileUrl:fileUrl})
             ctx.body={
                code:0,
                result:""
            }
            return
         }
         await DB.insert("folder",p)
         ctx.body={
             code:0,
             result:""
         }
    }
}