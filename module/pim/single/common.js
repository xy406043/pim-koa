const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");
const moment = require("moment");
const qiniu = require("qiniu");

module.exports = {
  addGroup: async ctx => {
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
  getGroupList: async ctx => {
    let p = {
      groupType: ctx.request.body.groupType,
      user_id: ctx.user.user_id
    };

    let result = (await DB.find("group", p)).result;
    ctx.body = {
      code: 0,
      result: result
    };
  },
  /**
   * @上传图片
   * @表单格式上传到七牛云返回链接
   */
  getQiniuToken: async ctx => {
    let {name,type} = ctx.request.body
    qiniu.conf.ACCESS_KEY = "EWUa148HGdwVjQlrq_AJJ8viqRT4KoOy4kgeFTYh";
    qiniu.conf.SECRET_KEY = "bwhG3NtQyXPIqe_SCZue8YhIvrhf6IpSFkzPPrO4";
    //要上传的空间
    const bucket = "xynagisa";
    //上传到七牛后保存的文件名
    const key = new Date().valueOf() +'_'+ name;
    console.log(key)
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
  getOVerView: async ctx => {
    let id = ctx.user.user_id;
    console.log("user_id", id);
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
        endAt: { $exists: false }
      })
    ).result;
    const unFinishedProject = (
      await DB.count("todos", {
        user_id: id,
        endAt: {$exists:true, $gte: new Date() }
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
  }
};
