const router =require("koa-router")()
const common = require("./single/common")
const user = require("./user/user")

router.use("/common",common)
router.use("/user",user)
module.exports = router.routes()