const DB = require("../../db/db-mongoose");
const Crypto = require("../../../libs/crypoto");

module.exports={
    getFileList: async  (ctx,next) =>{
        let {sortBy} = ctx.request.body
        let condition ={
            user_id:ctx.user.user_id,
            project_id:{$exists:false}
        }
        let options={
        }
        if(sortBy===1){
            options.sort={
                type:1
            }
        }else if(sortBy===2){
            options.sort={
                size:1
            }
        }
        console.log("条阿金",options)
        let result =(await DB.where("folder",condition,options)).result
        ctx.body={
            code:0,
            result:result
        }

    },
    addFile: async  (ctx,next) =>{
         let {name,showName,size,type,fileUrl} =ctx.request.body
         let p={
             user_id:ctx.user.user_id,
             name,
             showName,
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