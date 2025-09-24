const axios = require("axios")
const { getPetHealth } = require("../Models/index")
const { invokeTool } = require("../Tools/database")
const { json } = require("express")
const { invokeLocation } = require("../Tools/location")

async function getDeviceData(req, res) {
    try {
        const search = req.params['slug']

        const response = (await axios.get(`https://finstinctbackend-avacf2bca2cxcxcf.eastus-01.azurewebsites.net/api/SensorReading?deviceName=${search}`))
        const result = await response.data       
        const res = await getPetHealth('Have there been any temperature alerts?',result)
         return res.status(500).json(res)
    } catch (error) {
        return res.status(500).json(error.message)
    }
}


async function answerQuestion(req,res) {
    try {
        
        const {question, serialNumber}= req.body

        const response = await invokeTool(question,serialNumber)

        return res.status(200).json({response})
        
    } catch (error) {
        
        return res.status(500).json(error.message)
        
    }
}



async function answerLocations(req,res) {
    try {
        
        const {question, serialNumber}= req.body

        const response = await invokeLocation(question,serialNumber)

        return res.status(200).json({response})
        
    } catch (error) {
        
        return res.status(500).json(error.message)
        
    }
}
module.exports = {
    getDeviceData,
    answerQuestion,
    answerLocations
}