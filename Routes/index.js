const {Router}= require("express")
const { getDeviceData, answerQuestion, answerLocations, communicationFunc, strategistFunc } = require("../Controller/deviceController")

const router = Router()


router.get("/test/:slug", getDeviceData)
router.post("/qa",answerQuestion )
router.post("/movement",answerLocations )
router.post("/communication",communicationFunc )
router.post("/strategist",strategistFunc )

module.exports={
    router
}