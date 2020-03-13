const router = require('koa-router')()
const Project = require("../../../module/pim/project/project")

/**
 * @项目
 */
router.post("/addProject",Project.addProject)
router.get("/getProjectList",Project.getProjectList)
router.post("/editProject",Project.editProject)
router.get("/deleteProject",Project.deleteProject)
router.get("/getProjectDetail",Project.getProjectDetail)
router.post("/addTag",Project.addTag)
/**
 * @任务
 */
router.post('/addTodo',Project.addTodo)
router.get('/getTodoDetail',Project.getTodoDetail)
router.get('/deleteTodo',Project.deleteTodo)
router.post('/editTodo',Project.editTodo)
router.post('/changeState',Project.changeState)
router.post('/changeFinishState',Project.changeFinishState)
/**
 * @任务清单
 */
router.post("/addList",Project.addList)
router.post("/editList",Project.editList)
router.get("/getListList",Project.getListList)
router.get("/removeOutList",Project.removeOutList)
router.get("/getListDetail",Project.getListDetail)
router.get("/archiveList",Project.archiveList)
router.get("/deleteList",Project.deleteList)
/**
 * @日程
 */
router.post("/addSchedule",Project.addSchedule)
router.post("/editSchedule",Project.editSchedule)
router.get("/deleteSchdeule",Project.deleteSchedule)
router.post("/getScheduleList",Project.getScheduleList)
router.get("/getScheduleDetail",Project.getScheduleDetail)
router.post("/getMonthScheduleList",Project.getMonthScheduleList)
module.exports =router.routes()