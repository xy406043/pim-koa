const router = require('koa-router')()
const user = require("./person/users")
const todo = require("./project/todo")
const note = require("./konwledge/note")
const project = require("./project/project")
const mome = require("./konwledge/memo")
const address = require("./single/address")
const time = require("./time/time")
const blog = require("./konwledge/blog")
const documet = require("./single/document")


router.use("/user",user)
router.use("/todo",todo)
router.use("/note",note)
router.use("/project",project)
router.use("/mome",mome)
router.use("/address",address)
router.use("/time",time)
router.use("/blog",blog)
router.use("/documet",documet)


module.exports = router.routes()