const router = require('koa-router')()
const common = require("../../../module/pim/single/common")

/**
 * @通用模块
 */

 router.post("/addGroup",common.addGroup)
 router.post("/editGroup",common.editGroup)
 router.get("/deleteGroup",common.deleteGroup)
 router.post("/getGroupList",common.getGroupList)
 router.get("/getOverView",common.getOVerView)
 router.post("/getQiniuToken",common.getQiniuToken)
 router.post("/getSearchContent",common.getSearchContent)
 router.get("/getLimitNotice",common.getLimitNotice)
 router.post("/getNoticeList",common.getNoticeList)
 router.post("/setRead",common.setRead)
module.exports =router.routes()