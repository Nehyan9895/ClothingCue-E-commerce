const User = require('../model/userModel');
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cartModel');
const Order = require('../model/orderModel');


const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const productData = await Product.find({});
        const categoryData = await Category.find({});

        const userCart = await Cart.find({ userId: userId }).populate('products.productId');

        let totalAmount = 0;
        userCart.forEach((cartItem) => {
            totalAmount += cartItem.salesPrice * cartItem.products.quantity;
        })

        res.render('checkout', { products: productData, user: user, cart: userCart, category: categoryData })

    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    try {
        const addressIndex = req.body.selectedAddress;
        const total = req.body.totalAmount;
        console.log(total);
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const selectedAddress = user.address[addressIndex];
        let orderMethod = 'COD';
        let paymentStatus = 'Pending';

        // Declare orderProducts outside the if block
        const orderProducts = [];

        if (selectedAddress) {
            const userCart = await Cart.find({ userId: userId }).populate('products.productId');

            userCart.forEach((cartItem) => {
                cartItem.products.forEach((product) => {
                    console.log(product.size, product.quantity);
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
                    const sizeToUpdate = product.sizes.find(
                        size => size == orderedProduct.size
                    );
                    if (sizeToUpdate) {
                        console.log('Found sizeToUpdate:', sizeToUpdate);
                        sizeToUpdate.quantity -= orderedProduct.quantity;
                        sizeToUpdate.quantity = Math.max(0, sizeToUpdate.quantity); // Ensure quantity doesn't go negative

                        // Save the updated product with reduced quantities
                        await product.save();
                        console.log(`Quantity updated for product ${orderedProduct.productId}, size ${orderedProduct.size}`);
                    } else {
                        // console.log(`Size ${orderedProduct.size} not found for product ${orderedProduct.productId}`);
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
        console.log(error.message);
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
                { $inc: { wallet: order.totalAmount } },
            );
            order.paymentStatus = 'Refunded';
            await order.save()
        }
        res.render('order-details', { user, category, cart, order })
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
             

        res.render('admin/orderdetails', { order: orders, msg: false })

    } catch (error) {
        res.redirect('/error')
    }
}


module.exports = {
    loadCheckout,
    placeOrder,
    userOrderDetails,
    loadOrderList,
    userCancelOrder,
    loadOrderDetails,
    cancelOrder
}