const User = require('../model/userModel');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const config = require('../config/config');
const { error } = require('console');
const userModel = require('../model/userModel');
const Products = require('../model/productModel')
const Cart = require('../model/cartModel')
const Category = require('../model/categoryModel')
const Order = require('../model/orderModel');
const Wishlist = require('../model/wishlistModel');
const Banner = require('../model/bannerModel')
const Wallet = require('../model/walletModel');
const ITEMS_IN_PAGE = 12;
const otpStore = {};
function sendVerificationCode(email, req, res) {

    try {
        // Create a transporter with your SMTP configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'muhammednehyan9895@gmail.com',
                pass: 'afrausmaurdcrlad',
            },
        });

        //generate verification code
        const generateVerificationCode = () => {
            return Math.floor(1000 + Math.random() * 9000).toString();
        }
        //send verification code
        const verificationCode = generateVerificationCode();
        // Set expiration time to one minute from now
        const expirationTime = Date.now() + 60 * 1000;

        otpStore[email] = {
            code: verificationCode,
            expiresAt: expirationTime,
        };

        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'Verification code',
            html: `<p>Hi there, Your Verification code to sign up in Clothing Cue is ${verificationCode}.</p>`,
        };

        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email Sent: ' + info.response);
                req.session.otp = verificationCode;

                setTimeout(() => {
                    req.session.otp = null;
                    console.log('OTP destroyed after one minute');
                }, 60000);

                res.render('otpPage', { message: "",verification:verificationCode });
            }
        })


    } catch (error) {
        res.render('error')
    }
};




//to load registration page
const loadRegister = async (req, res) => {
    try {
        const message1 = '';
        const message = ' ';
        res.render('login', { message1,message});
    } catch (error) {
        res.redirect('/error')
    }
}

const insertUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        const existingNumber = await User.findOne({ mobile: req.body.mobile });
        const message=' ';
        if (existingUser) {
            res.render('login', { message1: "this email is already exist." ,message })
        } else if (existingNumber) {
            res.render('login', { message1: "This mobile number is already exist." ,message})
        }


        console.log(req.body);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            is_verified: 1 //initialize as zero and get one after verificaton
        });
        req.session.user = user;
        
        if (req.session.user) {
            sendVerificationCode( req.body.email, req, res)

        } else {
            res.render('login', { message1: "Your registration has been failed...",message });
        }

    } catch (error) {
        res.redirect('/error')
    }
}

const otpVerify = async (req, res) => {
    try {
        console.log(req.body)
        console.log(req.session.otp, req.body.otp, req.session.user);

        if (req.body.otp === req.session.otp) {
            
            await userModel.insertMany(req.session.user);
            res.redirect('/home');
        } else {
            res.render('otpPage', { message: "Incorrect otp pin" })
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const resendOtp = async (req, res) => {
    const { name, email } = req.session.user;

    // Clear previous OTP if it exists
    delete otpStore[email];

    // Generate and send a new OTP
    sendVerificationCode(email, req, res);
};


const loginLoad = async (req, res) => {
    try {
        const message = ' ';
        const message1 = ' ';
        res.render('login', { message ,message1});
    } catch (error) {
        res.redirect('/error')
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email, password: password })
        const message1= ' ';
        if (userData) {
            if (userData.is_verified == 1) {
                req.session.user_id = userData._id;
                res.redirect('/home');
            } else {
                res.render('login', { message: 'This account is blocked by the admin',message1 })
            }
        } else {
            res.render('login', { message: "Email or password is incorrect",message1 })
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const userLogout = async (req, res) => {
    try {

        if (req.session.user_id) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/'); // Redirect to a different route after destroying the session
                }
            });
        } else {
            res.redirect('/');
        }

    } catch (error) {
        res.redirect('/error')
    }
}

const forgetPassword = async (req, res) => {
    try {
        let message = "";
        res.render('forget', { message });
    } catch (error) {
        console.log(error.message)
    }
}
const sendForgotOtp = async (req, res) => {
    const { email } = req.body;

    // Generate and send OTP to the provided email
    sendVerificationCode(email, req, res)
}

const verifyForgetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(req.body);
        req.session.resetEmail = email;

        // Retrieve the stored OTP and expiration time from your storage (e.g., database)
        const storedOtp = otpStore[email]?.code;
        const expirationTime = otpStore[email]?.expiresAt;

        // Check if the entered OTP matches the stored OTP
        if (storedOtp && otp === storedOtp) {
            // Check if the OTP is still valid (within the expiration time)
            if (expirationTime && Date.now() < expirationTime) {
                // OTP is valid, proceed with password reset logic
                res.render('reset', { email, message: '' });
            } else {
                // OTP has expired, render a page with an error message
                res.render('forget', { message: 'OTP has expired. Please try again.' });
            }
        } else {
            // Incorrect OTP, render a page with an error message
            res.render('forget', { message: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        res.redirect('/error')
    }
};

const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const email = req.session.resetEmail;
        console.log('Change password request received:', { email, newPassword, confirmPassword });

        // Validate that newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.render('reset', { message: 'Passwords do not match.' });
        }

        // TODO: Hash the newPassword before storing it in the database (for security)
        // For example, you can use bcrypt to hash the password

        // Update the user's password in the database
        const result = await User.updateOne({ email }, { $set: { password: newPassword } });
        console.log(result);
        // Redirect the user to a success page or login page
        console.log("passowrd changed");
        res.redirect('/login');
    } catch (error) {
        res.redirect('/error')
    }
}


const loadHome = async (req, res) => {

    try {
        const banners = await Banner.find({});
        const userData = await User.findById(req.session.user_id)
        const category = await Category.find({})
        const productData = await Products.find({}).populate('category')
        req.session.productId = req.query.id;
        const productId = req.body.productId;
        const productIdObject = new mongoose.Types.ObjectId(productId);
        const totalStock = await Products.aggregate([
            {
                $match: {
                    _id: productIdObject
                }
            },
            {
                $unwind: "$sizes"
            },
            {
                $addFields: {
                    totalStock: {
                        $sum: {
                            $add: [
                                "$sizes.s.quantity",
                                "$sizes.m.quantity",
                                "$sizes.l.quantity"
                            ]
                        }
                    }
                }
            }
        ]);
        
        

        
        res.render('homePage', { user: userData, products: productData,banners,categories:category,totalStock });
    } catch (error) {
        res.redirect('/error')
    }
}

const searchResult = async(req,res)=>{
    try {
        const searchTerm = req.body.search;
        const cat = req.body.cat;
        const regex = new RegExp(searchTerm, 'i');
        const user = await User.findById(req.session.user_id);
        const categories = await Category.find({});
        if(cat=='all'){
           
            const matchProducts = await Products.find({status:true,name:regex});
           
                res.render('searchResult',{products:matchProducts,user,category:categories,msg:searchTerm})
            
           
        }else{
            const catId = await Category.findById(cat)
            const matchingProducts = await Products.find({  status: true, name: regex, category: catId._id });
            res.render('searchResult',{products:matchingProducts,user,category:categories,msg:searchTerm})      
        }
        
        
        
        

        
        
    } catch (error) {
        console.log(error.message)
    }
}

const pagination = async(req,res)=>{
    try {
        const page = parseInt(req.query.page)||1;
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const category = await Category.find({});
        const products = await Products.find({status:true}).populate('category').skip((page-1)*ITEMS_IN_PAGE).limit(ITEMS_IN_PAGE)
        const totalProductsCount = await Products.countDocuments({status:true});
        
        res.render('shop',{products,categories:category,user,category,msg:'fromhome',currentPage:page,totalPages:Math.ceil(totalProductsCount/ITEMS_IN_PAGE)})
        
    } catch (error) {
        console.log(error.message);
    }
}

const categorySearch = async (req, res) => {
    try {
        const userId = req.session.user_id
        const categoryName = req.query.catId;
        const by = req.query.by
        const products = await Products.find({ category: categoryName })
        const category = await Category.find({})
        const user = await User.findById(userId)
        
        
        if (by) {
            if (by > 0) {
                const products = await Products.find({ category: categoryName }).sort({ salesPrice: 1 })
                res.render('searchResult', { products: products, user, category, msg: 'fromcat' })
            } else {
                const products = await Products.find({ category: categoryName }).sort({ salesPrice: -1 })
                res.render('searchResult', { products: products, user, category, msg: 'fromcat' });
            }
        } else {
            res.render('searchResult', {  products: products, user, category, msg: 'fromcat' });
        }



    } catch (error) {
        // res.redirect('/error')
        console.log(error.message)
    }
}

const sorting = async (req, res) => {
    try {
        const by = parseInt(req.query.by);
        const page = parseInt(req.query.page) || 1;
        const userId = req.session.user_id;
        const start = parseInt(req.query.start);
        const end = parseInt(req.query.end);
        const user = await User.findById(userId);
        const category = await Category.find({});
        let sortCriteria;

        if (by) {
            sortCriteria = { salesPrice: by };
        }

        let query = {
            status: true,
        };

        if (start !== undefined && end !== undefined) {
            query.salesPrice = { $gte: start, $lte: end };
        }

        const products = await Products.find(query)
            .populate('category')
            .sort(sortCriteria)
            .skip((page - 1) * ITEMS_IN_PAGE)
            .limit(ITEMS_IN_PAGE);

        const totalProductsCount = await Products.countDocuments(query);

        res.render('shop', {
            products,
            user,
            categories: category,
            msg: 'fromhome',
            currentPage: page,
            totalPages: Math.ceil(totalProductsCount / ITEMS_IN_PAGE),
        });
    } catch (error) {
        console.log(error.message);
    }
};




    const loadProductDetails = async (req, res) => {
        try {
            const categories = await Category.find({});
            const productId = req.query.id;
            console.log(productId);
            const products = await Products.findById(productId).populate('category')
            const productIdObject = new mongoose.Types.ObjectId(productId);
            const totalStock = await Products.aggregate([
                {
                    $match: {
                        _id: productIdObject
                    }
                },
                {
                    $unwind: "$sizes"
                },
                {
                    $group: {
                        _id: null,
                        totalStock: {
                            $sum: {
                                $add: [
                                    "$sizes.s.quantity",
                                    "$sizes.m.quantity",
                                    "$sizes.l.quantity"
                                ]
                            }
                        }
                    }
                }
            ]);
            
            console.log(totalStock);
            
            
            const user = await User.findById(req.session.user_id);
            if(req.session.user_id){
                if(productId){
                res.render('productDetails', { products,user:user,totalStock,categories})
                }else{
                    res.redirect('/home')
                }
            }else{
                res.render('productDetails',{products,user,totalStock,categories})
            }
            
        } catch (error) {
            // res.redirect('/error')
            console.log(error.message);
        }

    }
const addToCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const quantity = req.body.selectedQuantity;
        const size = req.body.size;
        console.log(size+"adfsjbjdf");
        const productId = req.body.productId;
        
        // Check if there is an existing cart for the user
        const existingCart = await Cart.findOne({ userId: userId });

        if (existingCart) {
            // Check if the product with the same productId and size already exists in the cart
            const existingProduct = existingCart.products.find(product => product.productId + '' === productId && product.size === size);

            if (existingProduct) {
                // If the product exists, update its quantity
                existingProduct.quantity += parseInt(quantity, 10);
            } else {
                // If the product does not exist, add the new product to the cart
                existingCart.products.push({
                    productId: productId,
                    size: size,
                    quantity: parseInt(quantity, 10)
                });
            }

            // Save the updated cart
            await existingCart.save();
        } else {
            // If there is no existing cart, create a new cart and add the product
            const obj = {
                productId: productId,
                size: size,
                quantity: parseInt(quantity, 10)
            };

            const cartItem = {
                userId: userId,
                products: [obj]
            };
            console.log(cartItem);

            const newCart = await Cart.create(cartItem);
        }

        res.redirect('/cart');
    } catch (error) {
        res.redirect('/error')
    }
};





const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const categories = await Category.find({})
        const products = await Products.find({})
        const sizeStock = 0;
        if (req.session.user_id) {
            const userId = req.session.user_id;

            // Assuming you have a function to fetch the cart for a specific user
            const userCart = await Cart.find({ userId: userId })
                .populate('products.productId').populate({
                    path:'products.productId',
                    populate:{
                        path:'category',
                        model:'Category'
                    }
                })
            if(userData.is_verified==1){
            res.render('cart', { user: userData,products, cart: userCart,sizeStock ,categories});
            }else{
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        // res.redirect('/error')
        console.log(error.message);
    }
};

const updateQuantity = async (req, res) => {
    try {
        const { cartId, newQuantity, productId } = req.body;

        // Assuming cartId is the _id of the cart
        let cart = await Cart.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
       

        const cartProduct = cart.products.forEach((product) => {
            
            if (product._id+'' == productId) {
                product.quantity = newQuantity;
            }
        });
        // const size = cartProduct.size;
        // const availableStock = product.sizes[0].find((sizeInfo) => sizeInfo[size].quantity);

        // if (newQuantity > availableStock) {
        //     return res.status(400).json({ message: "Exceeded available stock for the specific size" });
        // }

        await cart.save();

        res.json({ message: "Quantity updated successfully" });
    } catch (error) {
        res.redirect('/error')
    }
};


const removeCartItem = async (req, res) => {
    try {
        const cartId = req.query.cartId;
        const productIdToRemove = req.query.productId;
        console.log('Removing product:', productIdToRemove, 'from cart:', cartId);

        const updatedCart = await Cart.findByIdAndUpdate(
            cartId,
            { $pull: { products: { _id: productIdToRemove } } },
            { new: true }
        );

        console.log('Product removed. Updated cart:', updatedCart);

        res.redirect('/cart');
    } catch (error) {
        res.redirect('/error')
    }
}

const loadAddressForm = async (req,res)=>{
    try {
        res.render('addressform');
    } catch (error) {
        res.redirect('/error')
    }
}

const loadWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        let wallet = await Wallet.findOne({ user: userId });

        if (!wallet) {
            wallet = await Wallet.create({ user: userId });
        }

        const categories = await Category.find({});
        res.render('wallet', { wallet, category:categories,user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const addAddress = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const addressName = req.body.addressName;
        const name = req.body.name;
        const lname = req.body.lname;
        const phone = req.body.phone;
        const city = req.body.city;
        const pincode = req.body.pincode;
        const landmark = req.body.landmark;
        const house = req.body.house;
        const road = req.body.road;
        const description =req.body.description;
        const country = req.body.country;

        const user = await User.findById(userId);

        if(user){
            const newAddress = {
                addressName:addressName,
                fname:name,
                lname:lname,
                phone:phone,
                city:city,
                pincode:pincode,
                landmark:landmark,
                house:house,
                road:road,
                description:description,
                country:country
            };
            user.address.push(newAddress);
            await user.save();
            res.redirect('/checkout');
        }
        


    } catch (error) {
        res.redirect('/error')
    }
}

const loadAccount = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const categories = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const order = await Order.find({ userId: userId })
            .sort({ orderDate: -1 }) // Sort by orderDate in descending order for latest first
            .populate('products.productId');
            if(user.is_verified==1){
        res.render('account',{user,categories,cart,order})
            }else{
                res.redirect('/login')
            }
    } catch (error) {
        res.redirect('/error')
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const i = req.query.i
        const act = req.query.act;
        const userId = req.session.user_id;
        const user = await User.findById(userId)
        if (act == 0) {
            user.address.splice(i, 1);
            await user.save();
            res.redirect('/account')
        } else {
            res.render('editAddressForm', { user: user, i })
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const updateAddress = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const i = req.body.i;
        const user = await User.findById(userId);

        if(user){
            const updatedAddress ={
            addressName:req.body.addressName,
            fname:req.body.name,
            lname:req.body.lname,
            phone:req.body.phone,
            city:req.body.city,
            pincode:req.body.pincode,
            landmark:req.body.landmark,
            house:req.body.house,
            road:req.body.road,
            country:req.body.country,
            description:req.body.description,
            };
            user.address[i] = updatedAddress;
            await user.save();
            res.redirect('/account');
        }
    } catch (error) {
        res.redirect('/error')
    }
}

const uploadUserImage = async(req,res)=>{
    try {
        
        const image= req.files.map(file => file.path)
        const userId = req.session.user_id;
        await User.findByIdAndUpdate(userId,{$set:{image:image[0]}})
        
        res.redirect('/account')
    } catch (error) {
        res.redirect('/error')
    }
}

const updateUser = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);

        user.name = req.body.name;
        user.email = req.body.email;
        user.mobile = req.body.mobile;
        await user.save();
        res.redirect('/account');
    } catch (error) {
        res.redirect('/error')
        }
}

const userError = async(req,res)=>{
    try {
        const msg= req.query.msg

        if(msg){
            res.render('error',{msg:true})
        }else{
            res.render('error',{msg:false})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const categoryData = await Category.find({});

        if(userId){
            if(userData.is_verified==1){
            const wishlist = await Wishlist.findOne({userId:userId}).populate('products.productId');
            res.render('wishlist',{user:userData,category:categoryData,wishlist});
            }else{
                res.redirect('/login')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const productId = req.query.productId;
        const wishItem = {productId:productId};
        const userWishlist = await Wishlist.findOne({userId:userId})
        if (userWishlist && userWishlist.products.some(item => item.productId.toString() === productId.toString())) {



            const user = await User.findById(req.session.user_id);
            const categoryData = await Category.find({})
            const productsData = await Products.find({}).populate('category')
            const userCart = await Cart.findOne({ userId: userId }).populate('products.productId');
            res.render('homePage', {  products: productsData, user: user, cart: userCart, category: categoryData, msg: '0' })
           

        } else {
            const wishlist = await Wishlist.findOneAndUpdate(
                { userId: userId },
                { $push: { products: wishItem } },
                { upsert: true, new: true }
            );

            res.redirect('/wishlist');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const removeWishlistProduct = async(req,res)=>{
    try {
        const productId = req.query.productId;
        const userId = req.session.user_id;
        const index = req.query.index;

        const wishlist = await Wishlist.findOne({userId:userId});

        if(index!==-1){
            wishlist.products.splice(index, 1);
            await wishlist.save();
        }
        res.redirect('/wishlist');
    } catch (error) {
        res.redirect('/error')
    }
}







module.exports = {
    loadRegister,
    insertUser,
    otpVerify,
    resendOtp,
    sendForgotOtp,
    verifyForgetOtp,
    changePassword,
    loginLoad,
    userLogout,
    forgetPassword,
    verifyLogin,
    loadHome,
    loadProductDetails,
    searchResult,
    pagination,
    categorySearch,
    sorting,
    loadCart,
    addToCart,
    updateQuantity,
    removeCartItem,
    loadAddressForm,
    addAddress,
    loadEditAddress,
    loadAccount,
    updateAddress,
    uploadUserImage,
    updateUser,
    userError,
    loadWishlist,
    addToWishlist,
    removeWishlistProduct,
    loadWallet
}