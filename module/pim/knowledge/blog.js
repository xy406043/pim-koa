const DB = require("../../db/db-mongoose");
const mongoose = require("mongoose");
module.exports = {
  getBlogList: async (ctx) => {
    let pageSize = ctx.request.body.pageSize;
    let currentPage = ctx.request.body.currentPage;
    let condition = {
      user_id:new mongoose.Types.ObjectId(ctx.user.user_id),
    };
    if(  ctx.request.body.group_id){//博客必须有分类)
         condition.group_id=ctx.request.body.group_id
    } 
    let options = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
      sort: { updatedAt: -1 },
    };
    let title = new RegExp(ctx.request.body.selectTitle, "i");
    if (ctx.request.body.selectTitle) {
      condition.title = { $regex: title };
    }
    let aggregate = [
      {
        $lookup: {
          from: "blog_tags",
          localField: "tag",
          foreignField: "_id",
          as: "tagInfo",
        }
      },
      {
        $lookup: {
          from: "group",
          localField: "group_id",
          foreignField: "_id",
          as: "groupInfo",
        }
      },
      {
        $match: condition,
      },
      {
        $sort: options.sort,
      },
      {
        $skip: options.skip,
      },
      {
        $limit: options.limit,
      },
    ];
    let populate=["tag","group_id"]
    const result =(await DB.where2("blog",condition,options,populate)).result;
    // const result = (await DB.where3("blog", aggregate))
    let abc ={
      user_id:ctx.user.user_id
    }
   let count =(await DB.count("blog",condition)).result
    ctx.body = {
      code: 0,
      result: result,
      totalCount:count,
      pageSize:pageSize,
      currentPage:currentPage
    };
  },
  getBlogInfo: async (ctx) => {
    let id = ctx.query.id;
    let populate =["tag","group_id"]
    let result = (await DB.findById2("blog", id,{},{},populate)).result;
    ctx.body = {
      code: 0,
      result: result,
    };
  },
  addBlog: async (ctx) => {
    let p = ctx.request.body;
    let data = {
      title: p.title,
      content: p.content,
      user_id: ctx.user.user_id,
      group_id: p.group_id,
      tag: p.tag,
      author:p.author,
      isReproduced:p.isReproduced,
      reproduceUrl:p.reproduceUrl
    };
    await DB.insert("blog", data);
    ctx.body = {
      code: 0,
      result: "",
    };
  },
  editBlog: async (ctx) => {
    let p = ctx.request.body;
    let data = {
      title: p.title,
      content: p.content,
      group_id: p.group_id,
      tag: p.tag,
      author:p.author,
      isReproduced:p.isReproduced,
      reproduceUrl:p.reproduceUrl
    };
    await DB.findByIdAndUpdate("blog", p.blog_id, data);
    ctx.body = {
      code: 0,
      result: "",
    };
  },
  deleteBlog: async (ctx) => {
    let id = ctx.query.id;
    await DB.deleteById("blog", id);
    ctx.body = {
      code: 0,
      result: "",
    };
  },
  getLimitBlog: async (ctx) => {
    let id = ctx.user.user_id;
    let options = {
      limit: ctx.request.body.limit,
      sort: { id: -1 },
    };
    let list = (await DB.where("blog", { user_id: id }, options)).result;
    ctx.body = {
      code: 0,
      result: list,
    };
  },

  /**
   * @标签
   */
  getTags: async (ctx) => {
    //  let id = ctx.user.user_id
    //  let condition={
    //  }
    //  let result =(await DB.find)
  },
  addBlogTag: async (ctx) => {
    let {name,color} =ctx.request.body
      let condition ={
          name:name
      }
      let rel =(await DB.findOne("blog_tags",condition)).result
      if(rel){
          ctx.body={
              code:0,
              result:{
                  id:rel._id
              }
          }
      }else{
          let p={
              name:name,
              color:color
          }
         let result =(  await DB.insert("blog_tags",p)).result
         ctx.body={
             code:0,
             result:{
                 id:result._id
             }
         }

      }
  },
  editBlogTag: async (ctx) => {},
};
