const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");
const moment = require("moment");
const qiniu = require("qiniu");

module.exports = {
  addGroup: async (ctx, next) => {
    let p = {
      user_id: ctx.user.user_id,
      name: ctx.request.body.name,
      description: ctx.request.body.description,
      groupType: ctx.request.body.groupType
    };
    let abs = (await DB.find("group", { name: ctx.request.body.name })).result;
    if (abs.length !== 0) {
      ctx.body = {
        code: 1,
        errorMsg: "该分组已存在"
      };
      return;
    }
    await DB.insert("group", p);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  editGroup: async (ctx, next) => {
    let { group_id, name } = ctx.request.body;
    let p = {
      name: name
    };
    await DB.findByIdAndUpdate("group", group_id, p);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  deleteGroup: async (ctx, next) => {
    let id = ctx.query.id;
    await DB.deleteById("group", id);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  getGroupList: async (ctx, next) => {
    let p = {
      groupType: ctx.request.body.groupType,
      user_id: ctx.user.user_id
    };

    let result = (await DB.find("group", p)).result;

    let tel = [];
    if (p.groupType === 1) {
      for (let item of result) {
        let condition = {
          user_id: ctx.user.user_id,
          group_id: item._id
        };
        /**
         * @这里不知怎么的没法直接把值放进去
         * @只能深复制出来再放值进去
         */
        let a = JSON.parse(JSON.stringify(item));
        a.count = (await DB.count("notes", condition)).result;
        // console.log(a)
        tel.push(a);
      }
    }

    if (p.groupType === 2) {
      for (let item of result) {
        let condition = {
          user_id: ctx.user.user_id,
          group_id: item._id
        };
        let a = JSON.parse(JSON.stringify(item));
        a.count = (await DB.count("bookmarkings", condition)).result;
        tel.push(a);
      }
    }
    ctx.body = {
      code: 0,
      result: tel
    };
  },
  /**
   * @上传图片
   * @表单格式上传到七牛云返回链接
   */
  getQiniuToken: async (ctx, next) => {
    let { name, type } = ctx.request.body;
    qiniu.conf.ACCESS_KEY = "EWUa148HGdwVjQlrq_AJJ8viqRT4KoOy4kgeFTYh";
    qiniu.conf.SECRET_KEY = "bwhG3NtQyXPIqe_SCZue8YhIvrhf6IpSFkzPPrO4";
    //要上传的空间
    const bucket = "xynagisa";
    //上传到七牛后保存的文件名
    // const key = new Date().valueOf() + "_" + name;
    const key = name;
    console.log(key);
    var putPolicy = new qiniu.rs.PutPolicy({ scope: bucket + ":" + key });
    const token = putPolicy.uploadToken();
    console.log("token", token);
    ctx.body = {
      code: 0,
      result: {
        token: token,
        name: key
      }
    };
  },
  getOVerView: async (ctx, next) => {
    let id = ctx.user.user_id;
    const allProjectNum = (await DB.count("projects", { user_id: id })).result;
    const allTodoNum = (await DB.count("todos", { user_id: id })).result;
    const allAddressNum = (await DB.count("addressBooks", { user_id: id }))
      .result;
    const allBookmarkingNum = (await DB.count("bookmarkings", { user_id: id }))
      .result;
    const allNoteNum = (await DB.count("notes", { user_id: id })).result;
    let weekStart = new Date(moment().startOf("week"));
    let weekEnd = new Date(moment().endOf("week"));
    const thisWeekProject = (
      await DB.count("todos", {
        user_id: id,
        endAt: { $exists: true, $gte: weekStart, $lte: weekEnd }
      })
    ).result;
    const toBeginProject = (
      await DB.count("todos", {
        user_id: id,
        status: 1,
        $or: [
          { endAt: { $exists: false } },
          { endAt: { $exists: true, $eq: null } }
        ]
      })
    ).result;
    const unFinishedProject = (
      await DB.count("todos", {
        user_id: id,
        endAt: { $exists: true, $gte: new Date() }
      })
    ).result;

    ctx.body = {
      code: 0,
      result: {
        allAddressNum: allAddressNum,
        allTodoNum: allTodoNum,
        allProjectNum: allProjectNum,
        allNoteNum: allNoteNum,
        allBookmarkingNum: allBookmarkingNum,
        unFinishedProject: unFinishedProject,
        thisWeekProject: thisWeekProject,
        toBeginProject: toBeginProject
      }
    };
  },
  /**
   * 搜索内容
   */
  getSearchContent: async (ctx, next) => {
    let user_id = ctx.user.user_id;
    let { keyword } = ctx.request.body;
    let result = [];
    let key = new RegExp(keyword, "i");
    /**
     * @便于以下获取任务集名清单名
     */
    let project = (await DB.find("projects", { user_id: user_id })).result;
    let list = (await DB.find("todolist", { user_id: user_id })).result;
    let parent_todo = (
      await DB.find("todos", {
        user_id: user_id,
        parent_todo: { $exists: false }
      })
    ).result;
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

    function getListName(id) {
      for (let item of list) {
        if (id.toString() === item._id.toString()) {
          return item.name;
        }
      }
    }
    function getParentTodoName(id) {
      for (let item of parent_todo) {
        if (id.toString() === item._id.toString()) {
          return item.name;
        }
      }
    }
    /**
     * @任务集
     */
    let project_condition = {
      user_id: user_id,
      projectName: { $regex: key }
    };
    let project_about = (await DB.find("projects", project_condition)).result;
    for (let item of project_about) {
      result.push({
        name: item.projectName,
        _id: item._id,
        type: "任务集",
        createdAt: item.createdAt
      });
    }
    /**
     * @任务清单
     */
    let list_condition = {
      user_id: user_id,
      name: { $regex: key }
    };
    let list_about = (await DB.find("todolist", list_condition)).result;
    for (let item of list_about) {
      result.push({
        type: "任务清单",
        name: item.name,
        _id: item._id,
        project_id: item.project_id,
        projectName: getProjectName(item.project_id),
        createdAt: item.createdAt
      });
    }
    /**
     * @任务
     */
    let todo_condition = {
      user_id: user_id,
      name: { $regex: key }
    };
    let todo_about = (await DB.find("todos", todo_condition)).result;
    for (let item of todo_about) {
      //普通清单外任务
      if (!item.list_id && !item.parent_todo) {
        // console.log("name",getProjectName(item.project_id))
        result.push({
          type: "清单外任务",
          name: item.name,
          _id: item._id,
          project_id: item.project_id,
          projectName: getProjectName(item.project_id),
          createdAt: item.createdAt
        });
      }
      //清单任务
      if (item.list_id) {
        result.push({
          type: "清单任务",
          name: item.name,
          _id: item._id,
          project_id: item.project_id,
          projectName: getProjectName(item.project_id),
          list_id: item.list_id,
          listName: getListName(item.list_id)
        });
      }
      //子任务
      if (item.parent_todo) {
        result.push({
          type: "子任务",
          name: item.name,
          _id: item._id,
          project_id: item.project_id,
          projectName: getProjectName(item.project_id),
          parent_todo: item.parent_todo,
          parentTodoName: getParentTodoName(item.parent_todo)
        });
      }
    }
    ctx.body = {
      code: 0,
      result: result,
      totalCount: result.length
    };
  },
  /**
   *
   */
  getLimitNotice: async (ctx, next) => {
    let id = ctx.user.user_id;
    let time = new Date().valueOf();
    const Atime = new Date(time - 24 * 60 * 60 * 1000);
    const Btime = new Date();
    let condition = {
      user_id: id,
      $or: [
        {
          sendTime: { $gte: Atime, $lte: Btime }
        },
        {
          read: false
        }
      ]
    };
    let options = {
      sort: { sendTime: -1 }
    };
    let list = (await DB.where("notify", condition, options)).result;
    ctx.body = {
      code: 0,
      result: list
    };
  },
  getNoticeList: async (ctx, next) => {
    let { pageSize, currentPage } = ctx.request.body;
    let condition = {
      user_id: ctx.user.user_id
    };
    let options = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
      sort: { sendTime: -1 }
    };
    let list = (await DB.where("notify", condition, options)).result;
    let count = (await DB.count("notify", condition)).result;
    ctx.body = {
      code: 0,
      result: list,
      pageSize,
      currentPage,
      totalCount: count
    };
  },
  setRead: async (ctx, next) => {
    let condition = {
      user_id: ctx.user.user_id
    };
    let options = {
      read: true
    };
    await DB.updateMany("notify", condition, options);
    ctx.body = {
      code: 0,
      result: ""
    };
  }
};

/**
 * @使用方法
 */

