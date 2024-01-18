const mongoose = require('mongoose');

const addresSchema = new mongoose.Schema({
    addressName: { type: String },
    house: { type: String },
    city: { type: String },
    landmark: { type: String },
    country: { type: String },
    pincode: { type: Number },
    phone: { type: Number },
    fname: { type: String },
    lname: { type: String },
    description: { type: String },
})

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: true,
            },
            size: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    address: {
        type: addresSchema,
        required: true
    },
    orderDate: {
        type: Date,
        default:Date.now()
    },
    orderStatus: {
        type: String,
        enum: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"],
        default: "Order Placed"

    },
    totalAmount: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed", "Refunded"],
        default: "Pending"
    },
    PaymentMethod: {
        type: String,
        required: true
    },
    cancelReason: {
        type: String,

    },
    returnReason: {
        type: String
    },
    orderID: {
        type: String
    },
    razorId:{
        type:String
    },
    discount:{
        type:Number,
        default:0
    },
    appliedcoupon:{
        type:String
    },
    discountedAmount:{
        type:Number,
        default:function(){
            return this.totalAmount;
        }
    }
})

module.exports = mongoose.model('Order', orderSchema)