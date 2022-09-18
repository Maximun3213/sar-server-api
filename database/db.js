const mongoose = require('mongoose')


const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

        console.log('connected mongodb')
    } catch (error){
        throw (error)
    }
}

module.exports = connectDatabase