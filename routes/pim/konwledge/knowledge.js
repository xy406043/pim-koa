const router = require("koa-router")();
const note = require("../../../module/pim/knowledge/note");
const bill = require("../../../module/pim/knowledge/bill");
const label = require("../../../module/pim/knowledge/label");
const bookMarking = require("../../../module/pim/knowledge/bookMarkings");
const addressBook = require("../../../module/pim/knowledge/addressBooks");

/**
 * @日记
 */
router.post("/addNote",note.addNote)
router.post("/getNoteList",note.getNoteList)
router.get("/getNoteDetail",note.getNoteDetail)
router.get("/deleteNote",note.deleteNote)
router.post("/editNote",note.editNote)
router.post("/getLimitNote",note.getLimitNote)

/**
 * @账单
 */

/**
 * @便签
 */
/**
 * @网址收藏
 */
router.post("/addBookMark",bookMarking.addBookMark)
router.post("/getBookMarkList",bookMarking.getBookMarkList)
router.post("/getLimitBookMark",bookMarking.getLimitBookMark)
router.get("/deleteBookMarking",bookMarking.deleteBookMarking)
router.post("/editBookMarking",bookMarking.editBookMarking)
/**
 * @通讯录
 */
router.post("/addAddress",addressBook.addAddress)
router.post("/editAddress",addressBook.editAddress)
router.get("/deleteAddress",addressBook.deleteAddress)
router.post("/getAddressList",addressBook.getAddressList)
router.get("/getAddressDetail",addressBook.getAddressDetail)
router.post("/getLimitAddress",addressBook.getLimitAddress)

module.exports = router.routes();
