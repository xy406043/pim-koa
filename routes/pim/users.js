const router = require('koa-router')()
const User = require("../../module/pim/user")
// router.prefix('/users')

/**
 *   / 千万不能多写
 */
router.post('/login',User.login)

router.get('/getUserInfo', User.getUserInfo)
router.get('/register', User.register)

module.exports = router.routes()   //列表
