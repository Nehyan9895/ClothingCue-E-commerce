require('dotenv').config();
const express = require('express');
const User = require('../model/userModel');
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cartModel');
const Order = require('../model/orderModel');
const Razorpay = require('razorpay');
const Coupon = require('../model/couponModel')
const instance = new Razorpay({
    key_id:'rzp_test_8lqMYHTKoOw5LR',
    key_secret:'P89Mad5rcOYHfSABxBFEbFkp',
});




const loadCheckout = async (req, res) => {
    try {
        let couponCode    =req.query.couponCode
        let afterDiscount =parseInt(req.query.afterDiscount);
        let discount      =parseInt(req.query.discount);
        const userId      =req.session.user_id
        if ((typeof afterDiscount === 'undefined' || isNaN(afterDiscount)) && 
        (typeof discount === 'undefined' || isNaN(discount))) {
        afterDiscount = 0;
        discount = 0;
        couponCode = 0;
    }
    
        const currentDate = new Date();
        const coupons = await Coupon.find({
            status: true,
            expiryDate: { $gt: currentDate },
            redeemedUsers: { $nin: [userId]}
        });
       
        const user = await User.findById(userId)
        const productsData = await Product.find({})
        const categoryData = await Category.find({})
        const userCart = await Cart.find({ userId: userId }).populate('products.productId');
        let totalAmount = 0;
        userCart.forEach((cartItem)=> {
            cartItem.products.forEach((product) => {
            let price = product.productId.salesPrice;
            totalAmount += parseFloat(price*product.quantity);

            });
            });

        // Filter coupons based on minimum amount requirement
        const eligibleCoupons = coupons.filter(coupon => totalAmount >= coupon.limit);

        // Sort eligible coupons based on total amount in ascending order
        eligibleCoupons.sort((a, b) => a.minimumAmount - b.minimumAmount);
        res.render('checkout', { products: productsData, user: user, cart: userCart, category: categoryData,coupons:eligibleCoupons, msg: '1',afterDiscount,discount,couponCode,totalAmount})

    } catch (error) {
        // res.redirect('/error')
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    try {
        const wallet = req.body.wallet;
        const addressIndex = req.body.selectedAddress;
        const total = req.body.totalAmount;
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const couponCode = req.body.couponCode;
        const discount   =req.body.discount;
        const  total2 =req.body.afterdiscount;
        const selectedAddress = user.address[addressIndex];
        let orderMethod = 'COD';
        let paymentStatus = 'Pending';
        if(wallet == 'wallet' ){
            orderMethod = 'WALLET'
            paymentStatus= 'Success'
        }

        // Declare orderProducts outside the if block
        const orderProducts = [];

        if (selectedAddress) {
            const userCart = await Cart.find({ userId: userId }).populate('products.productId');

            userCart.forEach((cartItem) => {
                cartItem.products.forEach((product) => {
                    orderProducts.push({
                        productId: product.productId,
                        size: product.size,
                        quantity: product.quantity,

                    });
                });
            });

            for (const orderedProduct of orderProducts) {
                const product = await Product.findById(orderedProduct.productId);
            
                if (product) {
                    const sizeToUpdate = product.sizes.find(sizeObj => sizeObj[orderedProduct.size]);
                    
                    if (sizeToUpdate) {
                        sizeToUpdate[orderedProduct.size].quantity -= orderedProduct.quantity;
                        sizeToUpdate[orderedProduct.size].quantity = Math.max(0, sizeToUpdate[orderedProduct.size].quantity);
            
                        // Save the updated product with reduced quantities
                        await product.save();
                        console.log(`Quantity updated for product ${orderedProduct.productId}, size ${orderedProduct.size}`);
                    } else {
                        console.log(`Size ${orderedProduct.size} not found for product ${orderedProduct.productId}`);
                    }
                } else {
                    console.log(`Product with ID ${orderedProduct.productId} not found`);
                }
            }
            
        }

        let generateOID = Math.floor(100000 + Math.random() * 900000);
        let existingOrder = await Order.findOne({ orderID: generateOID });

        while (existingOrder) {
            generateOID = Math.floor(100000 + Math.random() * 900000);
            existingOrder = await Order.findOne({ orderID: generateOID });
        }
        const orderId = `ORD${generateOID}`;

        const newOrder = new Order({
            userId: userId,
            orderID: orderId,
            products: orderProducts,
            addressIndex: addressIndex,
            totalAmount: total,
            discount:discount,
            discountedAmount:total2,
            appliedcoupon:couponCode,
            PaymentMethod: orderMethod, // Assuming you have a payment option in the request
            paymentStatus: paymentStatus,
            orderDate: new Date(),
            address: {
                addressName: selectedAddress.addressName,
                house: selectedAddress.house,
                city: selectedAddress.city,
                landmark: selectedAddress.landmark,
                country: selectedAddress.country,
                pincode: selectedAddress.pincode,
                phone: selectedAddress.phone,
                road: selectedAddress.road,
                fname: selectedAddress.fname,
                lname: selectedAddress.lname,
                description: selectedAddress.description
                // Add other fields as needed
            }
        });

        await newOrder.save();
        await Cart.deleteMany({ userId: userId });
        if(wallet=='wallet'){
            user.wallet= user.wallet - total2
             await user.save();
          }
        const category = await Category.find({});
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const order = await Order.find({ userId: userId }).populate('products.productId').sort({ orderDate: -1 });
        res.render('account', { user, category, cart, order, msg: true });
    } catch (error) {
        console.log(error.message);
    }
};

const userOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.user_id
        const user = await User.findById(userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');

        res.render('order-details', { user, category, cart, order })
    } catch (error) {
        res.redirect('/error')
    }
}

const loadOrderList = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ orderDate: -1 }).populate('userId')


        res.render('orderList', { orders })
    } catch (error) {
        res.redirect('/error')
    }
}
const userCancelOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.user_id
        const newStatus = 'Cancelled'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const user = await User.findById(userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus === 'Cancelled')) {
            await User.findByIdAndUpdate(
                order.userId,
                { $inc: { wallet: order.discountedAmount } },
            );
            order.paymentStatus = 'Refunded';
            await order.save()
        }
        res.render('order-details', { user, category, cart, order })
    } catch (error) {
        res.redirect('/error')
    }
}

const updateStatus = async (req, res) => {
    try {
        const orderId = req.query.OID;
        const newStatus = req.body.orderStatus
       
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const order = await Order.findById(orderId)
        
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            await User.findByIdAndUpdate(
                order.userId,
                { $inc: { wallet: order.discountedAmount } },
                );
                order.paymentStatus = 'Refunded';
                await order.save()     
        }
        
        
        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        

        res.render('orderDetails', { order: orders, msg: true })

    

    } catch (error) {
        res.redirect('/error')
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');
        res.render('orderDetails', { order, msg: false })
    } catch (error) {
        res.redirect('/error')
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const newStatus = 'Cancelled'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )
        const order = await Order.findById(orderId)

        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus === 'Cancelled')) {
            await User.findByIdAndUpdate(
                order.userId,
                { $inc: { wallet: order.discountedAmount } },
            );
            order.paymentStatus = 'Refunded';
            await order.save()
        }

        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');


        res.render('orderDetails', { order: orders, msg: false })

    } catch (error) {
        res.redirect('/error')
    }
}

const userReturnOrder = async (req, res) => {
    try {
        const orderId = req.query.OID
        const userId = req.session.user_id
        const newStatus = 'Returned'
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        )


        const order = await Order.findById(orderId)
        const user = await User.findById(userId)
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
            const updatedUser = await User.findByIdAndUpdate(
                order.userId,
                {
                    $inc: { wallet: order.discountedAmount },
                   
                }
            );
        
            order.paymentStatus = 'Refunded';
               await order.save()     
        }
        
        const orders = await Order.findById(orderId)
            .populate('products.productId')
            .populate('userId');

           
        res.render('order-details', { user, category, cart, order:orders})
    } catch (error) {
        res.redirect('/error')
    }
}

const onlinePayment = async (req, res) => {
    try {
        const addressIndex = req.query.addressId;
        const total = parseInt(req.query.totalAmount);
        const couponCode = req.query.couponCode;
        const discount   =parseInt(req.query.discount);
        let  total2 =parseInt(req.query.afterdiscount);
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const selectedAddress = user.address[addressIndex];
        const orderMethod = 'Online Payment';
        const paymentStatus = 'Success';

        const orderProducts = [];

        if (selectedAddress) {
            const userCart = await Cart.find({ userId: userId }).populate('products.productId');

            userCart.forEach((cartItem) => {
                cartItem.products.forEach((product) => {
                    orderProducts.push({
                        productId: product.productId,
                        size: product.size,
                        quantity: product.quantity,
                    });
                });
            });

            // Update product quantities
            for (const orderedProduct of orderProducts) {
                const product = await Product.findById(orderedProduct.productId);
            
                if (product) {
                    const sizeToUpdate = product.sizes.find(sizeObj => sizeObj[orderedProduct.size]);
                    
                    if (sizeToUpdate) {
                        sizeToUpdate[orderedProduct.size].quantity -= orderedProduct.quantity;
                        sizeToUpdate[orderedProduct.size].quantity = Math.max(0, sizeToUpdate[orderedProduct.size].quantity);
            
                        // Save the updated product with reduced quantities
                        await product.save();
                        console.log(`Quantity updated for product ${orderedProduct.productId}, size ${orderedProduct.size}`);
                    } else {
                        console.log(`Size ${orderedProduct.size} not found for product ${orderedProduct.productId}`);
                    }
                } else {
                    console.log(`Product with ID ${orderedProduct.productId} not found`);
                }
            }
        }
        

        var options = {
            amount: total2 * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };

        instance.orders.create(options, async function (err, razorOrder) {
            try {
                if (err) {
                    console.error("Error creating Razorpay order:", err);
                    return res.status(500).json({ error: "An error occurred while placing the order." });
                }
        
                // Generate a unique order ID
                let generatedId = Math.floor(100000 + Math.random() * 900000);
                let existingOrder = await Order.findOne({ orderID: generatedId });
        
                while (existingOrder) {
                    generatedId = Math.floor(100000 + Math.random() * 900000);
                    existingOrder = await Order.findOne({ orderID: generatedId });
                }
        
                const orderId = `ORD${generatedId}`;
                // Create Razorpay order
        
                // Create a new order document
                const newOrder = new Order({
                    userId: userId,
                    razoID: razorOrder.id, // Access the 'id' property of razorOrder
                    orderID: orderId,
                    appliedcoupon:couponCode,
                    discount:discount,
                    discountedAmount:total2,
                    products: orderProducts,
                    totalAmount: total,
                    PaymentMethod: orderMethod,
                    paymentStatus: paymentStatus,
                    address: {
                        addressName: selectedAddress.addressName,
                        house: selectedAddress.house,
                        city: selectedAddress.city,
                        landmark: selectedAddress.landmark,
                        country: selectedAddress.country,
                        pincode: selectedAddress.pincode,
                        phone: selectedAddress.phone,
                        road: selectedAddress.road,
                        fname: selectedAddress.fname,
                        lname: selectedAddress.lname,
                        description: selectedAddress.description,
                    },
                });
        
                // Save the new order
                await newOrder.save();
        
                // Clear user's cart
                await Cart.deleteMany({ userId: userId });
                console.log('Order placed successfully:', razorOrder);
                res.status(200).json({ message: "Order placed successfully", razorOrder });
            } catch (error) {
                console.error("Error processing the order:", error);
                res.status(500).json({ error: "An error occurred while processing the order" });
            }
        });
        
    } catch (error) {
        res.redirect('/error')
    }
};


const paymentResponce = async (req, res) => {
    try {
        const status = req.query.status
        const userId = req.session.user_id;
        const orderId = req.query.orderId;
       
    
        await Order.updateOne({ razoID: orderId }, { $set: { paymentStatus: status } })
        const userCart = await Cart.find({ userId: userId }).populate('products.productId');
        const user = await User.findById(userId)
        const category = await Category.find({})
        const order = await Order.find({ userId: userId }).populate('products.productId').sort({orderDate:-1})

        res.render('account', { user, category, cart: userCart, order, msg: true })
    } catch (error) {
        res.redirect('/error')
    }
}

const addCoupon = async (req, res) => {
    try {
        const couponCode = req.body.code;
        const currentDate = new Date();
        const userId = req.session.user_id;
        const isCouponValid = await Coupon.find({
            couponCode: couponCode,
            status: true,
            expiryDate: { $gt: currentDate },
            redeemedUser: { $nin: [userId] }
        });

        if (isCouponValid && isCouponValid.length > 0) {  // Check if the array is not empty
            const userCart = await Cart.find({ userId: userId }).populate('products.productId');
            let totalAmount = 0;

            userCart.forEach((cartItem) => {
                cartItem.products.forEach((product) => {
                    let price = product.productId.salesPrice;
                    totalAmount += parseFloat(price * product.quantity);
                });
            });

            if (totalAmount >= parseFloat(isCouponValid[0].limit)) {  // Convert limit to a number
                const discount = isCouponValid[0].discount;
                const discountedAmount = totalAmount - discount;
                res.redirect(`/checkout?afterDiscount=${discountedAmount}&discount=${discount}&couponCode=${couponCode}`);
            } else {
                res.status(400).json({ message: 'Cart amount does not meet the coupon requirements' });
            }
        } else {
            res.status(404).json({ message: 'Invalid or expired coupon' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {
    loadCheckout,
    placeOrder,
    userOrderDetails,
    loadOrderList,
    updateStatus,
    userCancelOrder,
    loadOrderDetails,
    cancelOrder,
    userReturnOrder,
    onlinePayment,
    paymentResponce,
    addCoupon
}