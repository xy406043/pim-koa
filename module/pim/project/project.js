// const DB = require("../../db/db-mongodb")
const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");
const moment = require("moment");

module.exports = {
  /**
   * @项目Common
   */
  getProjectOverView: async (ctx, next) => {
    let id = ctx.query.id;
    console.log(id);
    // 总任务数目
    let condition = {
      project_id: id
    };
    let totalCount = (await DB.count("todos", condition)).result;
    //未安排任务  没有截止时间
    let condition1 = {
      project_id: id,
      $or: [
        { endAt: { $exists: false } },
        { endAt: { $exists: true, $eq: null } }
      ]
    };
    let unschedule = (await DB.count("todos", condition1)).result;
    //进行中任务
    let condition2 = {
      project_id: id,
      $or: [
        {
          startAt: {
            $lte: new Date()
          },
          endAt: {
            $gte: new Date()
          }
        },
        {
          startAt: {
            $exists: false
          },
          endAt: {
            $gte: new Date()
          }
        }
      ]
    };
    let ondoing = (await DB.count("todos", condition2)).result;
    //已完成任务
    let condition3 = {
      project_id: id,
      status: 4
    };
    let finished = (await DB.count("todos", condition3)).result;
    //已延误任务
    let condition4 = {
      project_id: id,
      endAt: { $lt: new Date() },
      status: { $ne: 4 }
    };
    let delaying = (await DB.count("todos", condition4)).result;
    ctx.body = {
      code: 0,
      result: {
        totalCount,
        unschedule,
        ondoing,
        finished,
        delaying
      }
    };
  },
  searchProject: async (ctx,next) => {},
  /**
   * @任务集基础信息设置项目
   */
  getProjectInfo: async (ctx,next) => {
    let id = ctx.query.id;
    let result = (await DB.findById("projects", id)).result;
    for (let item of result.tags) {
      /**
       * @统计任务中tags数组包含某一项
       * @如果是全部数据甚至不需要elemMatch
       * @description tags:item即可
       */
      let condition = {
        project_id: id,
        tags: { $elemMatch: item }
      };
      item.count = (await DB.count("todos", condition)).result;
    }
    ctx.body = {
      code: 0,
      result: result
    };
  },
  editProjectInfo: async (ctx,next) => {
    let { project_id, projectName, description } = ctx.request.body;
    let condition = { projectName, description };
    await DB.findByIdAndUpdate("projects", project_id, condition);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  /**
   * @descriiption 编辑任务集的标签，所有使用此标签的任务都要进行改变
   */
  editLabel: async (ctx,next) => {
    let { project_id, nowValue, color, originValue } = ctx.request.body;
    let tags = (await DB.findById("projects", project_id)).result.tags;
    for (let item of tags) {
      if (item.value === originValue) {
        item.value = nowValue;
      }
    }
    await DB.findByIdAndUpdate("projects", project_id, { tags: tags });

    /**
     * @description $[]是替换当前那一条的列表中的所有数据
     */
    let condition = {
      project_id: project_id,
      tags: { value: originValue, color: color }
    };
    let options = {
      $set: { "tags.$": { value: nowValue, color: color } }
    };
    await DB.updateMany("todos", condition, options);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  deleteLabel: async (ctx,next) => {
    /**
     * @同上
     * @options的pull进行筛选删除
     */
    let { project_id, value, color } = ctx.request.body;
    let options = {
      $pull: { tags: { value: value } }
    };
    await DB.findByIdAndUpdate("projects", project_id, options);

    let condition = {
      project_id: project_id
    };
    await DB.updateMany("todos", condition, options);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
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
  editProject: async (ctx,next) => {
    let id = ctx.request.body.id;
    let p = {
      collected: ctx.request.body.collected
    };
    await DB.findByIdAndUpdate("projects", id, p);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  /**
   * @获取项目列表
   */
  getProjectList: async (ctx,next) => {
    // 查找！！
    let condition = {
      user_id: ctx.user.user_id
    };
    let title = new RegExp(ctx.request.body.selectTitle, "i");
    if (ctx.request.body.selectTitle) {
      condition.projectName = { $regex: title };
    }
    let options = {
      sort: { collected: -1 }
    };
    console.log(user_id, options);
    let result = (await DB.where("projects", condition, options)).result;
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
      await DB.where(
        "todos",
        {
          project_id: id,
          list_id: { $exists: false },
          parent_todo: { $exists: false }
        },
        { sort: { status: 1 } }
      )
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
      const every_list = (
        await DB.where(
          "todos",
          {
            list_id: item._id,
            parent_todo: { $exists: false }
          },
          { sort: { status: 1 } }
        )
      ).result;
      all_todo[item.name] = {
        list_id: item._id,
        description: item.description,
        todoList: every_list
      };
    }

    let schedule = (
      await DB.where(
        "schedule",
        { project_id: id },
        { sort: { updatedAt: -1 } }
      )
    ).result;

    let fileList = (
      await DB.where("folder", { project_id: id }, { sort: { updatedAt: 1 } })
    ).result;

    ctx.body = {
      code: 0,
      result: {
        id: result._id,
        name: result.projectName,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        tags: result.tags,
        collected: result.collected,
        description: result.description,
        todoList: all_todo,
        scheduleList: schedule,
        fileList: fileList
      }
    };
  },
  /**
   * @新增tag
   */
  addTag: async (ctx, next) => {
    let project_id = ctx.request.body.project_id;
    let tags = ctx.request.body.tags;
    console.log(project_id, tags);
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
  getTodoDetail: async (ctx,next) => {
    let id = ctx.query.id;
    let todo = (await DB.findById("todos", id)).result;
    let project = (await DB.findById("projects", todo.project_id)).result;
    let todolist = (await DB.findById("todolist", todo.list_id)).result;
    let childTodos = (await DB.find("todos", { parent_todo: id })).result;
    let startAt = "";
    let endAt = "";
    if (todo.startAt) {
      startAt = moment(todo.startAt).format("YYYY-MM-DD HH:mm:ss");
    }
    if (todo.endAt) {
      endAt = moment(todo.endAt).format("YYYY-MM-DD HH:mm:ss");
    }
    if (todo !== "" && todo !== null) {
      ctx.body = {
        code: 0,
        result: {
          project_id: todo.project_id,
          projectName: project.projectName,
          projectTags: project.tags,
          list_id: todo.list_id,
          name: todo.name,
          status: todo.status,
          createdAt: todo.createdAt,
          updatedAt: todo.createdAt,
          finished: todo.finished,
          level: todo.level,
          description: todo.description,
          tags: todo.tags,
          isEnd: todo.isEnd,
          startAt: startAt,
          endAt: endAt,
          parent_todo: todo.parent_todo,
          listName: todolist !== null ? todolist.name : null,
          childTodos: childTodos,
          collected: todo.collected
        }
      };
    }
  },
  /**
   * @所有任务的筛选器
   */
  getTodoList: async (ctx,next) => {
    let id = ctx.user.user_id;
    let { todoType } = ctx.request.body;
    let all_result =[]
    let project = (await DB.find("projects", { user_id: user_id })).result;
    function getProjectName(id) {
      /**
       * @纯判断ID不行
       * @因为ObjectId每个都不同必须先转化成String类型
       */
      for (let item of project) {
        if (id.toString() === item._id.toString()) {
          return item.projectName;
        }
      }
    }
    if (todoType === 1) {
      //未安排任务
      let condition = {
        user_id: id,
        status: 1,
        $or: [
          { endAt: { $exists: false } },
          { endAt: { $exists: true, $eq: null } }
        ]
      };
      let result = (await DB.find("todos", condition)).result;
      for(let item of result){
        let  p={
          user_id:user_id,
          parent_todo:item._id
        }
        let child =(await DB.find("todos",p)).result
        all_result.push({
          _id:item._id,
          name:item.name,
          project_id:item.project_id,
          projectName:getProjectName(item.project_id),
          createdAt:item.createdAt,
          startAt:item.startAt,
          endAt:item.endAt,
          child:child
        })
      }
      ctx.body = {
        code: 0,
        result: all_result,
        todoType:todoType
      };
    }
    if (todoType === 2) {
      //已延误任务
      let condition = {
        user_id: id,
        endAt: { $exists: true, $gte: new Date() }
      };
      let result = (await DB.find("todos", condition)).result;
      for(let item of result){
        let  p={
          user_id:user_id,
          parent_todo:item._id
        }
        let child =(await DB.find("todos",p)).result
        all_result.push({
          _id:item._id,
          name:item.name,
          project_id:item.project_id,
          projectName:getProjectName(item.project_id),
          createdAt:item.createdAt,
          endAt:item.endAt,
          startAt:item.startAt,
          child:child
        })
      }
      ctx.body = {
        code: 0,
        result: all_result,
        todoType:todoType
      };
    }
    if (todoType === 3) {
      //本周任务
      let weekStart = new Date(moment().startOf("week"));
      let weekEnd = new Date(moment().endOf("week"));
      let condition = {
        user_id: id,
        endAt: { $exists: true, $gte: weekStart, $lte: weekEnd }
      };
      let result = (await DB.find("todos", condition)).result;
      for(let item of result){
        let  p={
          user_id:user_id,
          parent_todo:item._id
        }
        let child =(await DB.find("todos",p)).result
        all_result.push({
          _id:item._id,
          name:item.name,
          project_id:item.project_id,
          projectName:getProjectName(item.project_id),
          createdAt:item.createdAt,
          startAt:item.startAt,
          endAt:item.endAt,
          child:child
        })
      }
      ctx.body = {
        code: 0,
        result: all_result,
        todoType:todoType
      };
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
  editTodo: async (ctx,next) => {
    let id = ctx.request.body.id;
    let data = ctx.request.body.data;
    await DB.findByIdAndUpdate("todos", id, data);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  changeState: async (ctx,next) => {
    let todo_id = ctx.request.body.todo_id;
    let status = ctx.request.body.status;
    console.log("cahngeS", status);
    let DB_res = await DB.findByIdAndUpdate("todos", todo_id, {
      status: status
    });
    console.log("DB", DB_res);
    ctx.body = {
      code: 0,
      status: ""
    };
  },
  changeFinishState: async (ctx,next) => {
    let todo_id = ctx.request.body.todo_id;
    let finished = ctx.request.body.finished;
    console.log(finished);
    let state = finished ? 4 : 1;
    console.log(state);
    let DB_res = await DB.findByIdAndUpdate("todos", todo_id, {
      finished: finished,
      status: state
    });
    ctx.body = {
      code: 0,
      status: ""
    };
  },
  /**
   * 任务清单
   */
  addList: async (ctx,next) => {
    console.log("用户", ctx.user.user_id);
    let p = {
      user_id: ctx.user.user_id,
      project_id: ctx.request.body.project_id,
      name: ctx.request.body.name,
      description: ctx.request.body.description
    };
    let isC = await DB.findOne("todolist", { name: p.name });
    if (isC.result !== null) {
      ctx.body = {
        code: 12300,
        errorMsg: "该清单已存在"
      };
      return;
    }
    let result = await DB.insert("todolist", p);
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
  getListList: async (ctx,next) => {
    let id = ctx.query.id;
    let result = (await DB.find("todolist", { project_id: id })).result;
    ctx.body = {
      code: 0,
      result: result
    };
  },
  getListDetail: async (ctx,next) => {
    let id = ctx.query.id;
    let todoList = (await DB.findById("todolist", id)).result; //任务清单
    let todos = (await DB.find("todos", { list_id: id })).result;
    let project = (await DB.findById("projects", todoList.project_id)).result;
    ctx.body = {
      code: 0,
      result: {
        name: todoList.name,
        projectName: project.projectName,
        project_id: todoList.project_id,
        description: todoList.description,
        archived: todoList.archived, // 是否归档
        updatedAt: todoList.updatedAt,
        createdAt: todoList.createdAt,
        tags: project.tags,
        todos: todos
      }
    };
  },
  deleteList: async (ctx,next) => {
    let id = ctx.query.id;
    await DB.deleteById("todolist", id);
    await DB.delete("todos", { list_id: id });
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  removeOutList: async (ctx,next) => {
    /**
     * @将此任务对应的清单字段删除调
     */
    let id = ctx.query.id;
    await DB.findByIdAndUpdate("todos", id, { $unset: { list_id: "" } });
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  editList: async (ctx,next) => {
    let { list_id, project_id, name, description } = ctx.request.body;
    let condition = {
      project_id,
      name,
      description
    };
    await DB.findByIdAndUpdate("todolist", list_id, condition);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  archiveList: async (ctx,next) => {},
  addSchedule: async (ctx,next) => {
    console.log(ctx.request.body);
    let p = {
      project_id: ctx.request.body.project_id,
      user_id: ctx.user.user_id,
      title: ctx.request.body.title,
      description: ctx.request.body.description,
      startAt: new Date(ctx.request.body.startAt),
      endAt: new Date(ctx.request.body.endAt),
      notice: ctx.request.body.notice,
      address: ctx.request.body.address
    };
    const result = (await DB.insert("schedule", p)).result;

    ctx.body = {
      code: 0,
      reuslt: ""
    };
  },
  editSchedule: async (ctx,next) => {
    let id = ctx.request.body.schedule_id;
    let p = {
      title: ctx.request.body.title,
      description: ctx.request.body.description,
      startAt: new Date(ctx.request.body.startAt),
      endAt: new Date(ctx.request.body.endAt),
      notice: ctx.request.body.notice,
      address: ctx.request.body.address
    };

    const result = (await DB.findByIdAndUpdate("schedule", id, p)).result;
    ctx.body = {
      code: 0,
      reuslt: ""
    };
  },
  deleteSchedule: async (ctx,next) => {
    let id = ctx.query.id;
    await DB.deleteById("schedule", id);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  getScheduleDetail: async (ctx,next) => {
    let id = ctx.query.id;
    let result = (await DB.findById("schedule", id)).result;
    ctx.body = {
      code: 0,
      result: result
    };
  },
  getScheduleList: async (ctx,next) => {},
  /**
   * @时间段内
   */
  getMonthScheduleList: async (ctx,next) => {
    let op = ctx.request.body.startAt;
    let ed = ctx.request.body.endAt;
    console.log(op, ed);
    /**
     * gte 是大于等于
     */
    let condition = {
      user_id: ctx.user.user_id,
      $or: [
        {
          startAt: {
            $lte: ed
          }
        },
        {
          endAt: {
            $gte: ed
          }
        }
      ]
    };
    let list = (await DB.find("schedule", condition)).result;
    ctx.body = {
      code: 0,
      result: list
    };
  },
  /**
   * @文件
   */
  getFileList: async (ctx,next) => {
    let condition = {
      user_id: ctx.user.user_id,
      project_id: ctx.request.body.project_id
    };
    let list = (await DB.find("folder", condition)).result;
    ctx.body = {
      code: 0,
      result: result
    };
  },
  addFile: async (ctx,next) => {
    let { name, size, type, showName, fileUrl, project_id } = ctx.request.body;
    let condition = {
      user_id: ctx.user.user_id,
      name,
      showName,
      size,
      type,
      fileUrl,
      project_id
    };
    console.log(condition);
    await DB.insert("folder", condition);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  deleteFile: async (ctx,next) => {
    let id = ctx.query.id;
    await DB.deleteById("folder", id);
    ctx.body = {
      code: 0,
      result: ""
    };
  }
};
