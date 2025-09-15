const { ChatOpenAI } = require("@langchain/openai")
const { SystemMessage, HumanMessage } = require("@langchain/core/messages")
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({ path: path.resolve(__dirname, "../.env") })

dotenv.config
async function getPetHealth(question,context) {
    try {

        const model = new ChatOpenAI({
            modelName: "gpt-4o-mini",
            openAIApiKey: process.env.OPENAI_API_KEY,
            maxTokens: 1024,
            temperature: 0.9
        })

        const messages = [
            new SystemMessage(`
                You are a veterinary assistant AI. Your task is to analyze pet health data from sensors. You should provide a clear and concise health report including: 
                vital signs (heart rate, temperature), movement patterns (acceleration, gyroscope), and environment/location (GPS, altitude, speed). If any values are unusual, flag them and suggest possible concerns.
                `),
            new HumanMessage({
                content: `Here are the latest pet sensor readings:\n\n${JSON.stringify(context, null, 2)}\n\n
                Please answer ${question}.`
            })
        ]

     

        const response = await model.invoke(messages)
        return response.content
    } catch (error) {
        console.error("Error:", error);
    }
}



module.exports = {
    getPetHealth
}