const {Router}= require("express")
const { getDeviceData, answerQuestion } = require("../Controller/deviceController")

const router = Router()


router.get("/test/:slug", getDeviceData)
router.post("/qa",answerQuestion )

module.exports={
    router
}