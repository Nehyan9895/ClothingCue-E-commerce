const { Double } = require('mongodb');
const mongoose =require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required :true
    },
    description:{
        type:String,
        required:true,
    },
    regularPrice:{
        type:String,
        required:true
    },
    salesPrice:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    totalStock:{
        type:Number,
        required:true
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    sizes:[{
        size:{
            type:mongoose.Schema.Types.Mixed,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
}],
})

module.exports=mongoose.model('Products',productSchema)