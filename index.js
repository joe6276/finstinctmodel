const express = require('express')
const {json} =require("express")
const cors= require('cors')
const {router}= require("./Routes/index")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

//Midleware

app.use(json())
app.use(cors())

app.use("/finstinct", router)

app.get('/test',(req,res)=>{
    return res.send('<h1> Hello There !!s</h1>')
})

app.listen(process.env.PORT, ()=>{
    console.log("App Listening...");
    
})