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
        default:0  //check for otp verified
    },
    wallet:{
        type : Number
    },
    address:[
        {
            addressName : String,
            type : String,
            houseNo : String,
            city : String,
            landMark : String,
            state : String,
            pincode : Number,
            phone : Number,
            altPhone : Number
        }
    ]
})
module.exports = mongoose.model('users',userSchema);