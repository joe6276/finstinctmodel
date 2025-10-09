const sql = require("mssql");
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({path: path.resolve(__dirname, "../.env")})


const sqlConfig = {
   user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DATABASE,
  server:  process.env.AZURE_SERVER,
  connectionTimeout: 30000, 
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false 
  }
}

async function addMemory(question, answer, SerialNumber) {
  try {
    const pool = await sql.connect(sqlConfig);
    const res = await pool.request()
      .input("Question", sql.NVarChar(100), question)
      .input("Answer", sql.NVarChar(sql.MAX), answer)  // supports long text
      .input("SerialNumber", sql.NVarChar(100), SerialNumber)
      .query(`
        INSERT INTO Memory (Question, Answer, SerialNumber)
        VALUES (@Question, @Answer, @SerialNumber);
      `);

    return res;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}



// async function run(){
//     const result = await addMemory('What is ML?', 'Machine Learning', 'SN-002')
//     console.log(result);
// }

// run()


module.exports={
    addMemory
}