const { ChatOpenAI } = require("@langchain/openai")
const sql = require("mssql")
const path = require("path")
const dotenv = require("dotenv")
const { stringify } = require("querystring")
const OpenAI = require("openai")
const { addMemory } = require("../Memory")
const axios = require('axios')

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4"
    },

    azure: {
        server: process.env.AZURE_SERVER,
        database: process.env.AZURE_DATABASE,
        user: process.env.AZURE_USERNAME,
        password: process.env.AZURE_PASSWORD,
        port: 1433,
        options: {
            encrypt: true, // Required for Azure
            trustServerCertificate: false,
            connectTimeout: 30000,
            requestTimeout: 30000,
            enableArithAbort: true
        }
    }
}

const tools = new Map()

function validateQuery(query) {
    const normalizedQuery = query.trim().toLowerCase();

    // List of dangerous operations to block
    const dangerousOperations = [
        'delete',
        'drop',
        'truncate',
        'alter',
        'create',
        'insert',
        'update'
    ];

    // Check if query starts with any dangerous operation
    for (const operation of dangerousOperations) {
        if (normalizedQuery.startsWith(operation)) {
            throw new Error('Operation not allowed.');
        }
    }

    // Additional check for dangerous keywords anywhere in the query
    const dangerousKeywords = ['drop table', 'delete from', 'truncate table'];
    for (const keyword of dangerousKeywords) {
        if (normalizedQuery.includes(keyword)) {
            throw new Error('Operation not allowed.');
        }
    }

    // Ensure query starts with SELECT (allowing for whitespace and comments)
    const queryWithoutComments = normalizedQuery.replace(/\/\*.*?\*\//g, '').replace(/--.*$/gm, '').trim();
    if (!queryWithoutComments.startsWith('select')) {
        throw new Error('Operation not allowed.');
    }

    return true;
}
async function query(query) {
    try {
        validateQuery(query)
        const pool = await sql.connect(config.azure)
        const result = await pool.request().query(query);
        return result.recordset
    } catch (error) {
        console.error("Query Execution Failed", error.message)
        throw error
    }
}

function getTodayDateAndDay() {
    const today = new Date();

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${date}`;
    const dayName = days[today.getDay()];

    return `Today is ${formattedDate} (${dayName})`;
}



function registerTool(name, func, description, parameters = {}) {
    tools.set(name, {
        name,
        function: func,
        description,
        parameters
    })
}


function getTool(name) {
    return tools.get(name)
}


async function executeTool(name, args = {}) {
    const tool = getTool(name)
    if (!tool) {
        throw new Error(`Tool '${name}' not found`)
    }
    try {
        return await tool.function(args)
    } catch (error) {
        throw new Error(`Tool execution failed: ${error.message}`)
    }
}



function getToolDefinitions() {
    const definitions = []
    for (const [name, tool] of tools) {
        definitions.push({
            type: "function",  // 👈 REQUIRED
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        })
    }
    return definitions
}

registerTool(
    'getTodayDateAndDay',
    async (args) => {
        return getTodayDateAndDay()
    },
    "Returns  today date and  the day of the week",
    {
        type: "object",
        properties: {},
        required: []
    }
)



registerTool(
    'query',
    async (args) => {
        return await query(args.query)
    },
    "Run MSSQL SELECT query only , You are interacting with only one table called Memory. DELETE, DROP, UPDATE, INSERT, and other modifying operations are strictly prohibited. Avoid NULL values",
    {
        type: "object",
        properties: {
            query: {
                type: 'string',
                description: "The Query to be executed"
            }
        },
        required: ['query']
    }
)



const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})


async function strategistTool(message, DeviceserialNumber, userId, maxIterations = 15) {

    try {


        var response = await axios.get(`https://finstinctbackend-avacf2bca2cxcxcf.eastus-01.azurewebsites.net/api/Payment/${userId}`)
        var res = response.data
      
        
        if (res){
            let messages = [{ role: "user", content: message + 'For device serialNumber' + DeviceserialNumber }]
            let iteration = 0

            while (iteration < maxIterations) {
                iteration++

                const response = await client.chat.completions.create({
                    model: "gpt-4o-mini", // or "gpt-4o", "gpt-4.1"
                    messages,
                    tools: getToolDefinitions(),
                    tool_choice: "auto", // let GPT decide
                })

                const messageResponse = response.choices[0].message
                messages.push(messageResponse)

                // If GPT calls a tool
                if (messageResponse.tool_calls) {
                    for (const toolCall of messageResponse.tool_calls) {
                        const toolName = toolCall.function.name
                        const toolArgs = JSON.parse(toolCall.function.arguments)

                        console.log("👉 ChatGPT requested tool:", toolName)
                        console.log("🧾 With args:", toolArgs)

                        try {
                            const toolResult = await executeTool(toolName, toolArgs)
                            console.log("✅ Tool result:", JSON.stringify(toolResult, null, 2))

                            // Send tool result back
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(toolResult),
                            })
                        } catch (error) {
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: `Error: ${error.message}`,
                            })
                        }
                    }
                    continue // loop again
                }

                // Otherwise return GPT’s text
                await addMemory(message, messageResponse.content, DeviceserialNumber)
                return messageResponse.content
            }

            return "Max iterations reached"
        } else {
            return "Kindly Subscribe"
        }
    } catch (error) {
  
        return "Kindly Subscribe"
    }

}



module.exports = {
    strategistTool
}
// async function run(){
//     const result= await strategistTool("Why was his activity low today","ESP32_SENSOR_003",7)
//     //   const result= await strategistTool("DELETE all records")
//     console.log(result);
// }


// run()