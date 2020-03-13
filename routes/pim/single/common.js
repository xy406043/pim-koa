const router = require('koa-router')()
const common = require("../../../module/pim/single/common")

/**
 * @通用模块
 */

 router.post("/addGroup",common.addGroup)
 router.post("/getGroupList",common.getGroupList)
 router.get("/getOverView",common.getOVerView)
 router.post("/getQiniuToken",common.getQiniuToken)
module.exports =router.routes()