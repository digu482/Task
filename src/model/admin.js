const mongoose = require('mongoose');
const Adminschema = new mongoose.Schema({
    Name :{
        type : String,
    },
    email : {
        type : String, 
    },
    phone : {
        type : Number
    },
    password : {
        type : String
    },
    profile : {
        type : String
    },
    isdelete : {
        type : Boolean,
        default : false
    },
    token: {
        type: String
    }
},{ versionKey: false })

const Admin = new mongoose.model('admin', Adminschema);

module.exports = Admin;