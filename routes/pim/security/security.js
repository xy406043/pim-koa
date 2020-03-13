const router = require('koa-router')()
const security = require("../../../module/pim/security/security")
const codeBook = require("../../../module/pim/security/code-book")
const photo = require("../../../module/pim/security/photo")
const folder = require("../../../module/pim/security/folder")



/**
 * @security通用
 */
router.get("/getSecondCode",security.getSecondCode)
router.post("/addSecondCode",security.addSecondCode)
router.post("/verifyCode",security.verifyCode)

/**
 * @密码本
 */

 router.post("/addCode",codeBook.addCode)
 router.post("/getCodeList",codeBook.getCodeList)
 router.post("/editCode",codeBook.editCode)
 router.get("/deleteCode",codeBook.deleteCode)

 /**
  * @文件夹
  */
 router.post("/getFileList",folder.getFileList)
 router.post("/addFile",folder.addFile)
module.exports = router.routes();