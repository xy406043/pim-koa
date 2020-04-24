const DB = require("../../db/db-mongoose");

module.exports = {
  getBlogList: async (ctx) => {
    let pageSize = ctx.request.body.pageSize;
    let currentPage = ctx.request.body.currentPage;
    let condition = {
      user_id: ctx.user.user_id,
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
    //   {
    //     $lookup: {
    //       from: "group",
    //       localField: "group_id",
    //       foreignField: "_id",
    //       as: "groupInfo",
    //     }
    //   },
    //   {
    //       $lookup:{
    //           from:"tags",
    //           localField:"tag",
    //           foreignField:"_id",
    //           as:"tagInfo"
    //       }
    //   },
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
    console.log(aggregate)
    const result = (await DB.where3("blog", condition, options, aggregate))
      .result;
    ctx.body = {
      code: 0,
      result: result,
    };
  },
  getBlogInfo: async (ctx) => {
    let id = ctx.query.id;
    let result = (await DB.findById("blog", id)).result;
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
    let {value,color} =ctx.request.body
      let condition ={
          name:value
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
              name:value,
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
