const express = require('express');
const user_route = express();
const auth = require('../middleWares/userAuth')
const order_controller = require('../controller/orderController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


//setting up view
user_route.set('view engine','ejs');
user_route.set('views','./views/users');

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))


const user_controller = require('../controller/userController');


//for register page
user_route.get('/register',user_controller.loadRegister);
user_route.post('/register',user_controller.insertUser);

//for otp verifying page
user_route.post('/verify',user_controller.otpVerify);
user_route.get('/resendOtp',user_controller.resendOtp)
user_route.get('/forget',auth.isBlocked,user_controller.forgetPassword);
user_route.post('/sendOtp',user_controller.sendForgotOtp)
user_route.post('/forget',user_controller.verifyForgetOtp);
user_route.post('/changePassword',user_controller.changePassword);

//for login page
user_route.get('/',user_controller.loadHome);
user_route.get('/login',auth.isLogout,user_controller.loginLoad);
user_route.post('/login',user_controller.verifyLogin);
user_route.get('/logout',user_controller.userLogout);

//for loading home page
user_route.get('/home',user_controller.loadHome);
user_route.get('/productDetails',user_controller.loadProductDetails);
user_route.get('/shop',user_controller.pagination)
user_route.get('/categorysearch',user_controller.categorySearch)
user_route.get('/sorting',user_controller.sorting)
user_route.post('/',user_controller.searchResult);
//for cart 
user_route.get('/shopcart',auth.isLogin,auth.isBlocked,user_controller.loadCart)
user_route.post('/addtocart',auth.isLogin,user_controller.addToCart)
user_route.get('/cart',auth.isLogin,user_controller.loadCart);
user_route.put('/updateQuantity',auth.isLogin,user_controller.updateQuantity);
user_route.get('/removeCartItem',auth.isLogin,user_controller.removeCartItem);

//accounts page
user_route.get('/account',auth.isLogin,user_controller.loadAccount);
user_route.post('/updatepropic',auth.isLogin,upload.array('image',1),user_controller.uploadUserImage)
user_route.post('/updateuser',auth.isLogin,user_controller.updateUser);


//for address 
user_route.get('/addressform',auth.isLogin,user_controller.loadAddressForm)
user_route.post('/addressform',auth.isLogin,user_controller.addAddress)
user_route.get('/editAddress',auth.isLogin,user_controller.loadEditAddress);
user_route.post('/editAddress',auth.isLogin,user_controller.updateAddress);

//for checkout
user_route.get('/checkout',auth.isLogin,order_controller.loadCheckout)
user_route.post('/account',auth.isLogin,order_controller.placeOrder);
user_route.get('/getorderdetails',auth.isLogin,order_controller.userOrderDetails)
user_route.get('/usercancelorder',auth.isLogin,order_controller.userCancelOrder)
user_route.post('/onlinepayment',auth.isLogin,order_controller.onlinePayment)
user_route.get('/onlinepayment',auth.isLogin,order_controller.paymentResponce)
user_route.get('/userreturnorder',auth.isLogin,order_controller.userReturnOrder)
user_route.post('/applycoupon',auth.isLogin,order_controller.addCoupon);

//for wishlist
user_route.get('/wishlist',auth.isLogin,user_controller.loadWishlist);
user_route.get('/addtowishlist',auth.isLogin,user_controller.addToWishlist)
user_route.get('/removeitem-wishlist',auth.isLogin,user_controller.removeWishlistProduct)
user_route.get('/wallet',auth.isLogin,user_controller.loadWallet);


user_route.get('/error',user_controller.userError)

module.exports = user_route;