const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    expiryDate:{
        type:Date,
        required:true,
    },
    limit:{
        type:Number,
        required:true,
    },
    redeemedUser:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    description:{
        type:String,
    }
})

module.exports = mongoose.model('Coupon',couponSchema);