const http = require("./app")
const dotenv = require("dotenv")
const connectDatabase = require('./database/db.js')


dotenv.config({
    path: "./config/.env"
})
//connect database
connectDatabase()

//create server

http.listen(process.env.PORT, () => {
    console.log(`Listening...`)
})

