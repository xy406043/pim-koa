const router = require('koa-router')()
const Time = require("../../../module/pim/time/time")


router.get("/getTime",Time.getTime)
module.exports =router.routes()