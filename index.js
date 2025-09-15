const express = require('express')
const {json} =require("express")
const cors= require('cors')
const {router}= require("./Routes/index")


const app = express()

//Midleware

app.use(json())
app.use(cors())

app.use("/finstinct", router)


app.listen(4000, ()=>{
    console.log("App Listening...");
    
})