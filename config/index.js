const dotenv = require("dotenv")
const path = require("path")

dotenv.config({path: path.resolve(__dirname, "../.env")})
export const sqlConfig = {

  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DATABASE,
  server:  process.env.AZURE_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, 
    trustAZURE_SERVERCertificate: false
  }
}

