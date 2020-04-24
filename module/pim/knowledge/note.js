const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");


module.exports ={
    addNote: async  (ctx,next) => {
        let p =ctx.request.body
        let data ={
            title: p.title,
            content: p.content,
            user_id:ctx.user.user_id,
            group_id:p.group_id
        }
        await DB.insert("notes",data)
        ctx.body={
            code:0,
            result:""
        }
    },
    getNoteList: async  (ctx,next) => {
        let pageSize=ctx.request.body.pageSize
        let currentPage =ctx.request.body.currentPage
        let p ={
            skip: (currentPage-1)*pageSize,
            limit:pageSize,
            sort:{updatedAt:-1}
        }
        let options ={
            user_id:new mongoose.Types.ObjectId(ctx.user.user_id)
        }
        console.log(ctx.request.body)
        //morning分类
        if(ctx.request.body.group_id && ctx.request.body.group_id===1){
          /**
           * @或者写法
           * $or
           */
            options.$or=[
                {
                    group_id:{$exists:false}
                },{
                    group_id:null
                }
            ]
            }
        //其他分类
        if (ctx.request.body.group_id && ctx.request.body.group_id!==1){
            options.group_id=ctx.request.body.group_id
        }
        /**
         * @模糊查找写法
         * @regex正则字符串
         */
        let title = new RegExp(ctx.request.body.selectTitle,'i')
        if(ctx.request.body.selectTitle){
            options.title={$regex:title}
        }
        console.log(options)
        let populate= "group_id"
        /**
         * @aggregate管道严格按顺序执行
         */
        let aggregate =[
            {
                $lookup:{from:"group",localField:"group_id",foreignField:"_id",as:"groupInfo"}
            },
            {
                $match:options
            },
            {
                $sort:p.sort
            },
            {
                $skip:p.skip
            },
            {
                $limit:p.limit
            }
        ]
        let result =(await DB.where3("notes",options,p,aggregate)).result
        let count =(await DB.count("notes",options)).result
        ctx.body={
            code:0,
            result:result,
            totalCount:count,
            pageSize:pageSize,
            currentPage:currentPage
        }
    },
    deleteNote: async  (ctx,next) => {
          let id =ctx.query.id
          await DB.deleteById("notes",id)
          ctx.body={
            code:0,
            result:""
        }
    },
    editNote: async  (ctx,next) =>{
        let p =ctx.request.body
        let data ={
            title: p.title,
            content: p.content,
            group_id:p.group_id
        }
        await DB.findByIdAndUpdate("notes",p.note_id,data)
        ctx.body={
            code:0,
            result:""
        }

    },
    getNoteDetail: async  (ctx,next) => {
        let id =ctx.query.id
        let result = (await DB.findById("notes",id)).result
        ctx.body={
            code:0,
            result:result
        }
    },
    getLimitNote: async  (ctx,next) =>{
        let id= ctx.user.user_id
        let options ={
            limit:ctx.request.body.limit,
            sort:{_id:-1}
        }
        let list =(await DB.where("notes",{user_id:id},options)).result
        ctx.body={
            code:0,
            result:list
        }
    }
    
}