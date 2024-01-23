const mongoose = require('mongoose');

const transcactionSchema = new mongoose.Schema({
    amount :{
        type:Number,
        required:true
    },
    type:{
        type:String,
        enum:['credit','debit'],
        required:true
    },
    description:{
        type:String,

    },
    date:{
        type:Date,
        default:Date.now,
    }
})

const walletSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    balance:{
        type:Number,
        default:0
    },
    transcactions:[transcactionSchema]
})

module.exports = mongoose.model('Wallet',walletSchema)