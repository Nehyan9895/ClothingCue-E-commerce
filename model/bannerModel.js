const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    title1:{
        type:String,
    },
    title2:{
        type:String
    },
    title3:{
        type:String
    },
    title4:{
        type:String
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('Banner',bannerSchema)