// const DB = require("../../db/db-mongodb")
const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");
const moment=require("moment")

module.exports = {
  /**
   * @新建项目
   */
  addProject: async (ctx, next) => {
    let projectName = ctx.request.body.projectName;
    let data = {
      projectName,
      user_id: ctx.user.user_id
    };
    let result = await DB.insert("projects", data);
    if (result.code === 0) {
      ctx.body = {
        code: 0,
        result: ""
      };
    }
  },
  /**
   * @删除掉所有与本项目相关的
   * 包括  任务，日程等等
   */
  deleteProject: async (ctx, next) => {
    let id = ctx.query.id;
    let result = await DB.deleteById("projects", id);
    console.log("删除项目", result);
    if (result.code === 0) {
      ctx.body = {
        code: 0,
        result: ""
      };
    }
  },
  editProject: async ctx =>{
     let id = ctx.request.body.id
     let p ={
       collected:ctx.request.body.collected
     }
     await DB.findByIdAndUpdate("projects",id,p)
     ctx.body={
        code:0,
        result:""
     }
  },
  /**
   * @获取项目列表
   */
  getProjectList: async (ctx) => {
    // 查找！！
    let user_id = ctx.user.user_id;
    let options ={
      sort:{collected:-1}
  }
  console.log(user_id,options)
    let result =( await DB.where("projects",{user_id: user_id },options)).result;
      ctx.body = {
        code: 0,
        result: result
      };
  },
  /**
   * @获取详细的项目信息
   * @任务包括
   * @清单外任务
   * @各清单任务
   */
  getProjectDetail: async (ctx, next) => {
    let id = ctx.query.id;
    let all_todo = {};
    let result = (await DB.findById("projects", id)).result;
    let lists = (await DB.find("todolist", { project_id: id })).result;
    //清单外任务
    let todo = (
      await DB.find("todos", { project_id: id, list_id: { $exists: false },parent_todo:{$exists:false} })
    ).result;
    all_todo["offList"] = {
      todoList: todo
    };
    //清单任务
    /**
     * @不好在这里循环使用异步函数
     * @不然前端接受到的数据会缺少
     */
    for (let item of lists) {
      const every_list = (await DB.find("todos", { list_id: item._id,parent_todo:{$exists:false} })).result;
      all_todo[item.name] = {
        list_id: item._id,
        description: item.description,
        todoList: every_list
      };
    }

    let schedule = (await DB.where("schedule", { project_id: id },{sort:{updatedAt:-1}})).result;
    console.log("thsi",all_todo)
      ctx.body = {
        code: 0,
        result: {
          id: result._id,
          name: result.projectName,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          tags: result.tags,
          collected: result.collected,
          desciption: result.desciption,
          todoList: all_todo,
          scheduleList: schedule
        }
      };
  },
  /**
   * @新增tag
   */
  addTag: async (ctx, next) => {
    let project_id = ctx.request.body.project_id;
    let tags = ctx.request.body.tags;
    console.log(project_id,tags);
    let result = (
      await DB.findByIdAndUpdate("projects", project_id, { tags: tags })
    ).result;
    console.log(result);
    if (result) {
      ctx.body = {
        code: 0,
        result: ""
      };
    }
  },
  /**
   * @新增任务
   */
  addTodo: async (ctx, next) => {
    // console.log(ctx.user)
    let p = ctx.request.body;
    p.user_id = ctx.user.user_id;
    let result = await DB.insert("todos", p);
    if (result.code === 0) {
      ctx.body = {
        code: 0,
        result: ""
      };
    }
  },
  getTodoDetail: async (ctx) => {
   let id= ctx.query.id
   let todo = (await DB.findById("todos",id)).result
   let project = (await DB.findById("projects",todo.project_id)).result
   let todolist= (await DB.findById("todolist",todo.list_id)).result
   let childTodos =( await DB.find("todos",{parent_todo:id})).result
   let startAt = moment(todo.startAt).format("YYYY-MM-DD HH:mm")
   let endAt =moment(todo.endAt).format("YYYY-MM-DD HH:mm")
   if(todo!=='' && todo!==null){
       ctx.body={
           code:0,
           result:{
               project_id:todo.project_id,
                projectName:project.projectName,
                projectTags:project.tags,
                list_id:todo.list_id,
                name:todo.name,
                status:todo.status,
                createdAt:todo.createdAt,
                updatedAt:todo.createdAt,
                finished:todo.finished,
                level:todo.level,
                description:todo.description,
                tags:todo.tags,
                isEnd:todo.isEnd,
                startAt:startAt,
                endAt:endAt,
                parent_todo:todo.parent_todo,
                listName:(todolist!==null)?todolist.name:null,
                childTodos:childTodos,
                collected:todo.collected
           }
       }
   }
  },
  deleteTodo: async (ctx, next) => {
    let id = ctx.query.id;
    let result = await DB.deleteById("todos", id);
    if (result.code === 0) {
      ctx.body = {
        code: 0,
        result: ""
      };
    }
  },
  editTodo: async ctx => {
      let id = ctx.request.body.id
      let data  =  ctx.request.body.data
      await DB.findByIdAndUpdate("todos",id,data)
      ctx.body={
          code:0,
          result:''
      }
  },
  changeState: async ctx => {
      let todo_id = ctx.request.body.todo_id
      let status = ctx.request.body.status
      console.log("cahngeS",status)
      let DB_res = await DB.findByIdAndUpdate("todos",todo_id,{status:status})
      console.log("DB",DB_res)
      ctx.body={
          code:0,
          status:''
      }
  },
  changeFinishState: async ctx => {
      let todo_id= ctx.request.body.todo_id
      let finished= ctx.request.body.finished
      console.log(finished)
      let state = finished?4:1
      console.log(state)
      let DB_res = await DB.findByIdAndUpdate("todos",todo_id,{finished:finished,status:state})
      ctx.body={
          code:0,
          status:''
      }
  },
  /**
   * 任务清单
   */
  addList: async ctx => {
    // console.log(ctx.user)
    let p = {
      project_id: ctx.request.body.project_id,
      name: ctx.request.body.name,
      description: ctx.request.body.desciption,
      user_id: ctx.user.user_id
    };
    let isC = await DB.findOne("todolist", { name: p.name });
    console.log("isC", isC);
    if (isC.result !== null) {
      ctx.body = {
        code: 12300,
        errorMsg: "该清单已存在"
      };
      return;
    }
    let result = await DB.insert("todolist", p);
    console.log(result);
    if (result.code === 0) {
      ctx.body = {
        code: 0,
        result: ""
      };
    } else {
      ctx.body = {
        code: 99999,
        result: result.err
      };
    }
  },
  getListList: async ctx =>{
    let id = ctx.query.id
    let result = (await DB.find("todolist",{project_id:id})).result
    ctx.body={
      code:0,
      result:result
    }

  },
  getListDetail: async ctx => {
    let id = ctx.query.id
    let todoList = (await DB.findById("todolist",id)).result //任务清单
    let todos = (await DB.find("todos",{list_id:id})).result
    let project =(await DB.findById("projects",todoList.project_id)).result
    ctx.body={
        code:0,
        result:{
            name:todoList.name,
            projectName:project.projectName,
            project_id:todoList.project_id,
            description: todoList.name,
            archived:todoList.archived, // 是否归档
            updatedAt:todoList.updatedAt,
            createdAt:todoList.createdAt,
            tags:project.tags,
            todos:todos

        }
    }
  },
  deleteList: async ctx =>{
      let id = ctx.query.id
      await DB.deleteById("todolist",id)
      await DB.delete("todos",{list_id:id})
      ctx.body={
          code:0,
          result:''
      }
  },
  removeOutList: async ctx =>{
    let id =ctx.query.id
    await DB.findByIdAndUpdate("todos",id,{$unset:{"list_id":""}})
  },
  editList: async ctx => {},
  archiveList: async ctx => {},
  addSchedule: async ctx => {
    console.log(ctx.request.body)
    let  p ={
      project_id:ctx.request.body.project_id,
      user_id: ctx.user.user_id,
      title: ctx.request.body.title,
      description:ctx.request.body.description,
      startAt: new Date(ctx.request.body.startAt),
      endAt: new Date(ctx.request.body.endAt),
      notice: ctx.request.body.notice,
      address: ctx.request.body.address
    }
    const result = (await DB.insert("schedule",p)).result

    ctx.body={
      code:0,
      reuslt:""
    }
  
  },
  editSchedule: async ctx => {
    let  id = ctx.request.body.schedule_id
    let  p ={
      title: ctx.request.body.title,
      description:ctx.request.body.description,
      startAt: new Date(ctx.request.body.startAt),
      endAt: new Date(ctx.request.body.endAt),
      notice: ctx.request.body.notice,
      address: ctx.request.body.address
    }

    const result = (await DB.findByIdAndUpdate("schedule",id,p)).result
    ctx.body={
      code:0,
      reuslt:""
    }
  },
  deleteSchedule: async ctx => {
    let id =ctx.query.id
    await DB.deleteById("schedule",id)
    ctx.body={
      code:0,
      result:""
    }
  },
  getScheduleDetail: async ctx => {
    let id =ctx.query.id
    let result =(await DB.findById("schedule",id)).result
    ctx.body={
      code:0,
      result:result
    }

  },
  getScheduleList: async ctx =>{},
    /**
     * @时间段内
     */
  getMonthScheduleList: async ctx =>{
    let op  = ctx.request.body.startAt
    let ed= ctx.request.body.endAt
    console.log(op,ed)
    let condition ={
      $or:[{
        startAt:{
          $gte:op,
          $lte:ed
        }
      },{
        endAt:{
            $gte:op,
            $lte:ed
        }
      }]
    }
    let list =(await DB.find("schedule",condition)).result
    ctx.body={
      code:0,
      result:list
    }

  }
};
