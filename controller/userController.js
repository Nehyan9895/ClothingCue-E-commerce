const User = require('../model/userModel');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { error } = require('console');
const userModel = require('../model/userModel');
const Products = require('../model/productModel')
const Cart = require('../model/cartModel')
const Category = require('../model/categoryModel')
const Swal = require('sweetalert2')
const Order = require('../model/orderModel');

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

                res.render('otpPage', { message: "" });
            }
        })


    } catch (error) {
        console.log(error.message);
    }
};




//to load registration page
const loadRegister = async (req, res) => {
    try {
        const message1 = '';
        const message = ' ';
        res.render('login', { message1,message});
    } catch (error) {
        console.log(error.message);
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
            is_verified: 0 //initialize as zero and get one after verificaton
        });
        req.session.user = req.body;
        
        if (req.session.user) {
            sendVerificationCode( req.body.email, req, res)

        } else {
            res.render('login', { message1: "Your registration has been failed...",message });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req, res) => {
    try {
        console.log(req.body)
        console.log(req.session.otp, req.body.otp, req.session.user);

        if (req.body.otp === req.session.otp) {
            await userModel.insertMany(req.session.user);
            res.render('homePage');
        } else {
            res.render('otpPage', { message: "Incorrect otp pin" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resendOtp = async (req, res) => {
    const { name, email } = req.session.user;

    // Clear previous OTP if it exists
    delete otpStore[email];

    // Generate and send a new OTP
    sendVerificationCode(name, email, req, res);
};


const loginLoad = async (req, res) => {
    try {
        const message = ' ';
        const message1 = ' ';
        res.render('login', { message ,message1});
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.error(error);
        res.render('reset', { message: 'An error occurred. Please try again.' });
    }
}


const loadHome = async (req, res) => {

    try {

        const userData = await User.findById(req.session.user_id)
        const productData = await Products.find({})
        req.session.productId = req.query.id;


        res.render('homePage', { user: userData, products: productData });

    } catch (error) {
        console.log(error.message);
    }
}

const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.id;
        const products = await Products.findById(productId)
        const user = await User.findById(req.session.user_id);
        if(req.session.user_id){
            res.render('productDetails', { products,user:user})
        }else{
            res.render('productDetails',{products,user})
        }
        
    } catch (error) {
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
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
};





const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        if (req.session.user_id) {
            const userId = req.session.user_id;

            // Assuming you have a function to fetch the cart for a specific user
            const userCart = await Cart.find({ userId: userId })
                .populate('products.productId')
            // Render the EJS template with the cart data
            res.render('cart', { user: userData, cart: userCart });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
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
       

        cart.products.forEach((product) => {
            console.log(product._id+'' == productId);
            if (product._id+'' == productId) {
                product.quantity = newQuantity;
            }
        });
        

        await cart.save();

        res.json({ message: "Quantity updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
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
        console.log(error.message);
    }
}

const loadAddressForm = async (req,res)=>{
    try {
        res.render('addressform');
    } catch (error) {
        console.log(error.message);
    }
}

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
        console.log(error.message);
    }
}

const loadAccount = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const category = await Category.find({})
        const cart = await Cart.find({ userId: userId }).populate('products.productId');
        const order = await Order.find({ userId: userId })
            .sort({ orderDate: -1 }) // Sort by orderDate in descending order for latest first
            .populate('products.productId');
        res.render('account',{user,category,cart,order})
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
    }
}

const uploadUserImage = async(req,res)=>{
    try {
        
        const image= req.files.map(file => file.path)
        const userId = req.session.user_id;
        await User.findByIdAndUpdate(userId,{$set:{image:image[0]}})
        
        res.redirect('/account')
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
    updateUser
}