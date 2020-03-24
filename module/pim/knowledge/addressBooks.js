const DB = require("../../db/db-mongoose");

module.exports = {
  addAddress: async  (ctx,next) => {
      let p ={
          name:ctx.request.body.name,
          user_id:ctx.user.user_id,
          phoneList:ctx.request.body.phoneList,
          emailList:ctx.request.body.phoneList,
          qq:ctx.request.body.qq,
          interest:ctx.request.body.interest,
          mailAddress:ctx.request.body.mailAddress
      }
      await DB.insert("addressBooks", p);
      ctx.body = {
        code: 0,
        result: ""
      };
  },
  getAddressDetail: async  (ctx,next) => {},
  getAddressList: async  (ctx,next) =>{
      let pageSize = ctx.request.body.pageSize
       let currentPage = ctx.request.body.currentPage
      let condition={
          user_id:ctx.user.user_id,
      }
      let name = new RegExp(ctx.request.body.selectTitle,'i')
      if(ctx.request.body.selectTitle){
          condition.name={$regex:name}
      }
      let options={
          sort:{updatedAt:-1},
          skip:(currentPage-1)*pageSize,
          limit:pageSize
      }
      let result = (await DB.where("addressBooks",condition,options)).result
      let count =(await DB.count("addressBooks",condition)).result
      ctx.body={
          code:0,
          result:result,
          pageSize:pageSize,
          currentPage:currentPage,
          totalCount:count
      }
  },
  editAddress: async  (ctx,next) => {
      let id= ctx.request.body.id
      let p ={
          name:ctx.request.body.name,
          emailList: ctx.request.body.emailList,
          phoneList:ctx.request.body.phoneList,
          qq:ctx.request.body.qq,
          interest:ctx.request.body.interest,
          mailAddress:ctx.request.body.mailAddress
      }
      const result =(await DB.findByIdAndUpdate("addressBooks",id,p)).reuslt
      console.log(result)
      ctx.body={
        code:0,
        result:""
    }
    
  },
  deleteAddress: async  (ctx,next) => {
      let id =ctx.query.id
      const result =(await DB.deleteById("addressBooks",id)).result
      console.log(result)
      ctx.body={
          code:0,
          result:""
      }
  },
  getLimitAddress: async  (ctx,next) =>{
    let id= ctx.user.user_id
    let options ={
        limit:ctx.request.body.limit,
        sort:{_id:-1}
    }
    let list =(await DB.where("addressBooks",{user_id:id},options)).result
    ctx.body={
        code:0,
        result:list
    }
  }
};
