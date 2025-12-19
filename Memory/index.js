const sql = require("mssql");
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({ path: path.resolve(__dirname, "../.env") })


const sqlConfig = {
  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DATABASE,
  server: process.env.AZURE_SERVER,
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

async function addMemory(question, SerialNumber, model, role, userId) {
  try {
    const pool = await sql.connect(sqlConfig);
    const res = await pool.request()
      .input("Content",  sql.NVarChar(sql.MAX), question)
      .input("Role", sql.NVarChar(sql.MAX), role)
      .input("Model", sql.NVarChar(sql.MAX), model)  // supports long text
      .input("SerialNumber", sql.NVarChar(100), SerialNumber)
      .input("UserId", sql.NVarChar(100), userId)
      .query(`
        INSERT INTO Memory (Content, SerialNumber, Role, Model, UserId)
        VALUES (@Content, @SerialNumber, @Role, @Model, @UserId);
      `);

    return res;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}


async function getHistory(userId, model) {

  try {
    const pool = await sql.connect(sqlConfig);

    const res = await pool.request()
      .input("UserId", sql.NVarChar(100), userId)
      .input("Model", sql.NVarChar(100), model)
      .query(`
        SELECT 
          Id,
          Content,
          Role,
          Model,
          SerialNumber,
          UserId,
          CreatedAt
        FROM Memory
        WHERE UserId = @UserId
          AND Model = @Model
        ORDER BY CreatedAt ASC;
      `);

    return res.recordset;

  } catch (error) {
    console.error("getHistory error:", error);
    throw error;
  }
}




// async function run(){
//     const result = await addMemory(
//   "How do I deploy a Node.js app using Docker?",
//   "SN-2025-001",
//   "gpt-4.1",
//   "user",
//   "user-12345"
// );
// const result= await getHistory('7', 'Strategist')
// console.log(result);
// }

//  run()


module.exports = {
  addMemory,
  getHistory
}