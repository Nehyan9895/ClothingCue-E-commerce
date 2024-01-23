const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true //required required for registration
    },
    email:{
        type : String,
        required : true //required for registration
    },
    password:{
        type : String,
        required : true //required required for registration
    },
    mobile:{
        type : String,
        required : true //required required for registration
    },
    is_verified:{
        type:Number,
        default :0
    },
    is_admin:{
        type:Number,
        default:0
    },
    wallet:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Wallet',
        default:null
    },
    address:[{
        addressName:{type:String},
        house:{type:String},
        city:{type:String},
        landmark:{type:String},
        country:{type:String},
        pincode:{type:Number},
        phone:{type:Number},
        road:{type:String},
        fname:{type:String},
        lname:{type:String},
        description:{type:String}
    }],
    image:{
        type:String
    }
})
module.exports = mongoose.model('User',userSchema);