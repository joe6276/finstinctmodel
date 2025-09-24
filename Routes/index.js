const {Router}= require("express")
const { getDeviceData, answerQuestion, answerLocations } = require("../Controller/deviceController")

const router = Router()


router.get("/test/:slug", getDeviceData)
router.post("/qa",answerQuestion )
router.post("/movement",answerLocations )

module.exports={
    router
}