const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");

module.exports = {
  addBookMark: async ctx => {
    let p = {
      user_id: ctx.user.user_id,
      title: ctx.request.body.title,
      url: ctx.request.body.url,
      imgUrl: ctx.request.body.imgUrl,
      group_id: ctx.request.body.group_id
    };
    await DB.insert("bookmarkings", p);
    ctx.body = {
      code: 0,
      result: ""
    };
  },
  editBookMarking: async ctx =>{
      let id =ctx.request.body.bookMarking_id
      let p={
        title: ctx.request.body.title,
        url: ctx.request.body.url,
        imgUrl: ctx.request.body.imgUrl
      }
      await DB.findByIdAndUpdate("bookmarkings",id,p)
      ctx.body={
          code:0,
          result:""
      }

  },
  // 获取相关分类下所有的链接
  getBookMarkList: async ctx => {

      let condition ={
          user_id:ctx.user.user_id
      }
      let options ={
        sort:{updatedAt:-1}
      }
      if(ctx.request.body.group_id && ctx.request.body.group_id===1){
          condition.$or=[
              {
                  group_id:{$exists:false}
              },{
                  group_id:null
              }
          ]
          }
      //其他分类
      if (ctx.request.body.group_id && ctx.request.body.group_id!==1){
          condition.group_id=ctx.request.body.group_id
      }
      let title = new RegExp(ctx.request.body.selectTitle,'i')
      if(ctx.request.body.selectTitle){
          condition.title={$regex:title}
      }
    //   console.log(condition,options)
      const result =(await DB.where("bookmarkings",condition,options)).result
    ctx.body = {
      code: 0,
      result: result
    };
  },
  getLimitBookMark: async ctx => {
    let id = ctx.user.user_id;
    let options = {
      limit: ctx.request.body.limit,
      sort: { _id: -1 }
    };
    let list = (await DB.where("bookmarkings", { user_id: id }, options))
      .result;
    if (list) {
      ctx.body = {
        code: 0,
        result: list
      };
    } else {
      ctx.body = {
        code: -1,
        errorMsg: "未获取到数据"
      };
    }
  },
  deleteBookMarking: async ctx =>{
      let id =ctx.query.id
      await DB.deleteById("bookmarkings",id)
      ctx.body={
          code:0,
          result:""
      }
  }
};
