const router = require("koa-router")()
const User = require("../../../module/wx/user/user")

router.post("/wxLogin",User.wxLogin)
router.get("/getUserInfo",User.getUserInfo)
module.exports=router.routes()