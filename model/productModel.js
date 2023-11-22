const mongoose =require('mongoose');

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required :true
    },
    description:{
        type:String,
        required:true,
    },
    
})