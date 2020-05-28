const router = require('koa-router')()
const pim = require("./pim")
const wx =require("./wx")
router.use("/pim",pim)
router.use("/wx",wx)


module.exports = router
