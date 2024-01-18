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
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
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
    images:[
        {
            type:String,
            required:true
        }
    ],
    sizes: [
        {
            
            s: {
                quantity: {
                    type: Number,
                    default: 0,
                },
            },
            m: {
                quantity: {
                    type: Number,
                    default: 0,
                },
            },
            l: {
                quantity: {
                    type: Number,
                    default: 0,
                },
            },
        
        },
    ],
    date:{
        type:Date,
        default:Date.now()
    },
    discountedPrice:{
        type:Number,
        default:0
    },
    
})

module.exports=mongoose.model('Products',productSchema)