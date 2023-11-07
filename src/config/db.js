const mongoose = require("mongoose")
require('dotenv').config()

mongoose
.connect(process.env.MONGODB_URI, {})
.then(() => {
    console.log("Database connected");
}).catch((err) =>{
console.log("Dtabase Not Connected");
})
