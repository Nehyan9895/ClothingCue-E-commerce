const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    variantStatus:{
        type:Boolean,
        default:true,
    }
})

module.exports = mongoose.model('Variant',variantSchema);