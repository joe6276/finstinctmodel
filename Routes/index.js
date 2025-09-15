const {Router}= require("express")
const { getDeviceData, answerQuestion } = require("../Controller/deviceController")

const router = Router()


router.get("/test/:slug", getDeviceData)
router.get("/qa",answerQuestion )

module.exports={
    router
}