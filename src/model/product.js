const mongoose = require('mongoose');
const Productschema = new mongoose.Schema({
    ProductName :{
        type : String,
    },
    Status : {
        type : String,
        enum: ['Pending', 'Add','NoAdd'],
        default:'Pending'
    },
    productImage: {
        type: String,
    },
    createdBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
},{ versionKey: false })

const Product = new mongoose.model('product', Productschema);

module.exports = Product;