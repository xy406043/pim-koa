const DB = require("../../db/db-mongoose");
const Crypto = require("../../../libs/crypoto");

module.exports={
    getCodeList: async ctx =>{
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
    addCode: async ctx =>{

        let {affiliation,accountList,remarks} =ctx.request.body
        let p ={
            affiliation,
            accountList,
            remarks,
            user_id:ctx.user.user_id
        }
        await DB.insert("codebook",p)

        ctx.body={
            code:0,
            result:""
        }
    },
    editCode: async ctx =>{
        let {code_id,affiliation,accountList,remarks} =ctx.request.body
        let p={
            affiliation,
            accountList,
            remarks
        }
        await DB.findByIdAndUpdate("codebook",code_id,p)
        ctx.body={
            code:0,
            result:""
        }
    },
    deleteCode: async ctx =>{
        let id= ctx.query.id
        await DB.deleteById("codebook",id)
        ctx.body={
            code:0,
            result:""
        }
    }
}