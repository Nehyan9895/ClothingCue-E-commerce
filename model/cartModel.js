    const mongoose = require('mongoose');

    const addToCartSchema = new mongoose.Schema({
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        products:[
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref: "Products",
                    
                },
                    size:{
                        type:mongoose.Schema.Types.Mixed,
                        required:true
                    },
                    quantity:{
                        type:Number,
                        required:true
                    }                
            }
        ]
    })

    module.exports = mongoose.model('Cart',addToCartSchema)