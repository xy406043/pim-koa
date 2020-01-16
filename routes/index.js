const router = require('koa-router')()
const pim = require("./pim")

router.use("/pim",pim)
router.get("/sas",async (ctx,next) => {
    ctx.body = "sjaksj"
})

module.exports = router
