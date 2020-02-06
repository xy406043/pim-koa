const router = require('koa-router')()
const Project = require("../../../module/pim/project/project")

router.post("/addProject",Project.addProject)
router.get("/getProjectList",Project.getProjectList)
router.get("/deleteProject",Project.deleteProject)
router.get("/getProjectDetail",Project.getProjectDetail)

module.exports =router.routes()