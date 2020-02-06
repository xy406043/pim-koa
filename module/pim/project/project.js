// const DB = require("../../db/db-mongodb")
const DB = require("../../db/db-mongoose")


module.exports ={
    /**
     * @新建项目
     */
    addProject: async (ctx,next) => {
        let projectName = ctx.request.body.projectName
     let data={
         projectName,
         user_id:ctx.user.user_id
     }
        let result =await DB.insert("projects",data)
        console.log(result)
        ctx.body={
            code:0,
            result:""
        }
    },
    /**
     * @删除掉所有与本项目相关的
     * 包括  任务，日程等等
     */
    deleteProject: async (ctx,next) => {
       let id =ctx.query.id
       let result = await DB.deleteById("projects",id)
       console.log("删除项目",result)
       if(result){
           ctx.body={
               code:0,
               result:""
           }
       }
    },
    /**
     * @获取项目列表
     */
    getProjectList: async (ctx,next) => {
        // 查找！！   
        let user_id = ctx.user.user_id
        let result = await DB.find("projects",{user_id:user_id})
        console.log("查询结果",result)
        ctx.body={
            code:0,
            result:result
        }
    },
    /**
     * @获取详细的项目信息
     */
    getProjectDetail: async (ctx,next) => {
        let id = ctx.query.id
        let result = await DB.findById("projects",id)
        let todo = await DB.find("todos",{poject_id:id})
        let schedule = await DB.find("schedule",{prjects_id:id})
        console.log(result)
        if(result){
            ctx.body={
                code:0,
                result:{
                id:result._id,
                name:result.projectName,
                createdAt:result.createdAt,
                updatedAt:result.updatedAt,
                collected:result.collected,
                desciption:result.desciption,
                todoList:todo,
                scheduleList:schedule
                }
            }
        }
    }
}
