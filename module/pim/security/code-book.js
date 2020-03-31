const DB = require("../../db/db-mongoose");
const Crypto = require("../../../libs/crypoto");

module.exports={
    getCodeList: async  (ctx,next) =>{
        let {pageSize,currentPage,selectCode} = ctx.request.body
        let condition ={
            user_id:ctx.user.user_id
        }
        let code = new RegExp(selectCode,'i')
        if(selectCode){
            condition.affiliation={$regex:code}
        }
        let options={}
        let result =(await DB.where("codebook",condition,options)).result
        let count =(await DB.count("codebook",condition)).result
        ctx.body={
            code:0,
            result:result,
            totalCount:count,
            pageSize:pageSize,
            currentPage:currentPage
        }
    },
    addCode: async  (ctx,next) =>{

        let {affiliation,accountUrl,accountList,remarks} =ctx.request.body
        let p ={
            affiliation,
            accountList,
            remarks,
            accountUrl,
            user_id:ctx.user.user_id
        }
        await DB.insert("codebook",p)

        ctx.body={
            code:0,
            result:""
        }
    },
    editCode: async  (ctx,next) =>{
        let {code_id,affiliation,accountUrl,accountList,remarks} =ctx.request.body
        let p={
            affiliation,
            accountList,
            accountUrl,
            remarks
        }
        await DB.findByIdAndUpdate("codebook",code_id,p)
        ctx.body={
            code:0,
            result:""
        }
    },
    deleteCode: async  (ctx,next) =>{
        let id= ctx.query.id
        await DB.deleteById("codebook",id)
        ctx.body={
            code:0,
            result:""
        }
    }
}