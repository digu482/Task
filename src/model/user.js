const mongoose = require('mongoose');
const Userschema = new mongoose.Schema({
    Name :{
        type : String,
    },
    email : {
        type : String, 
    },
    companyName : {
        type : String,
    },
    phone : {
        type : Number
    },
    password : {
        type : String
    },
    Status : {
        type : String,
        enum: ['Pending', 'Approve','Reject'],
        default:'Pending'
    },
    profile: {
        type: String,
    },
    Timestamp: {
        type: Date,
        default: Date.now, 
    },
    role : {
        type: String,
        enum: ['User', 'Seller'],
        default:'User'
    },
    token: {
        type: String
    }
},{ versionKey: false })

const User = new mongoose.model('User', Userschema);

module.exports = User;