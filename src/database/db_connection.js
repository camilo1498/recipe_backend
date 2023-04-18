/// instances
require('dotenv').config()
const mongoose = require('mongoose')

/// get saved db uri
const { MONGO_DB_URI } = process.env

/// connecting to db
mongoose.connect(MONGO_DB_URI).then(() => {  /// success response
    console.log("DB connected")
}).catch(err => { /// error response
    console.error(err)
})

process.on('uncaughtException', error => { /// error response and close db connection
    console.error(error)
    mongoose.disconnect()
})