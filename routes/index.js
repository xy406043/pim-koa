const router = require('koa-router')()
const pim = require("./pim")

router.use("/pim",pim)


module.exports = router
