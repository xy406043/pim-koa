const router = require("koa-router")();
const User = require("../../../module/pim/person/user");
// router.prefix('/users')

/**
 * 三级路由！
 *   / 千万不能多写
 */
router.post("/login", User.login);

router.get("/getUserInfo", User.getUserInfo);
router.post("/register", User.register);
router.post("/sendCode", User.sendCode);
router.post("/editUserInfo", User.editUserInfo);

module.exports = router.routes(); //列表
