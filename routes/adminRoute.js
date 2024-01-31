const express = require('express');
const admin_route = express();
const session = require("express-session");
const config = require('../config/config');
const multer = require('multer');
const adminAuth = require('../middleWares/adminAuth');



const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')

admin_controller = require('../controller/adminController');
order_controller = require('../controller/orderController');

admin_route.use(express.static('public'))


const upload = multer({dest:'uploads/'})

admin_route.get('/',admin_controller.loadLogin);
admin_route.post('/',admin_controller.verifyLogin);
admin_route.get('/logout',admin_controller.adminLogout)

admin_route.get('/home',admin_controller.loadHome)

admin_route.get('/UsersList',adminAuth.isLogin,admin_controller.loadDashboard)
admin_route.get('/blockUser',adminAuth.isLogin,admin_controller.blockUser)

admin_route.get('/category',adminAuth.isLogin,admin_controller.loadCategories)
admin_route.post('/category',adminAuth.isLogin,admin_controller.addCategory)

admin_route.get('/blockCategories',adminAuth.isLogin,admin_controller.blockCategories)

admin_route.get('/editCategory/:id',adminAuth.isLogin,admin_controller.editCategoryLoad);
admin_route.post('/editCategory/:id',adminAuth.isLogin,admin_controller.editCategory)

admin_route.get('/productList',adminAuth.isLogin,admin_controller.loadProductList);
admin_route.get('/addProduct',adminAuth.isLogin,admin_controller.addProductLoad);

admin_route.post('/addProduct',adminAuth.isLogin,upload.array('images',5),admin_controller.addProduct);

admin_route.get('/blockProduct',adminAuth.isLogin,admin_controller.blockProduct);
admin_route.get('/editProduct',adminAuth.isLogin,admin_controller.editProductLoad)
admin_route.delete('/deleteImage/:productId/:imageIndex',adminAuth.isLogin,admin_controller.deleteImage)

admin_route.post('/editProduct',adminAuth.isLogin,upload.array('images',5),admin_controller.editProduct)
admin_route.get('/orderlist',adminAuth.isLogin,order_controller.loadOrderList);
admin_route.get('/orderdetails',adminAuth.isLogin,order_controller.loadOrderDetails)
admin_route.post('/updateorderstatus',adminAuth.isLogin,order_controller.updateStatus)
admin_route.get('/cancelorder',adminAuth.isLogin,order_controller.userCancelOrder);
admin_route.get('/salesReport',adminAuth.isLogin,admin_controller.loadSalesReport)
admin_route.post('/salesReport',adminAuth.isLogin,admin_controller.searchSalesReport);

// //variant management
// admin_route.get('/variant',adminAuth.isLogin,admin_controller.loadVariantPage)
// admin_route.post('/variant',adminAuth.isLogin,admin_controller.addVariant);
// admin_route.get('/blockVariant',adminAuth.isLogin,admin_controller.blockVariant);

admin_route.get('/coupon',adminAuth.isLogin,admin_controller.loadCoupon);
admin_route.post('/coupon',adminAuth.isLogin,admin_controller.addCoupon);
admin_route.get('/editCoupon',adminAuth.isLogin,admin_controller.loadEditCoupon);
admin_route.post('/editCoupon',adminAuth.isLogin,admin_controller.updateCoupon);
admin_route.get('/banner',adminAuth.isLogin,admin_controller.banners)
admin_route.post('/banner',adminAuth.isLogin,upload.array('image',1),admin_controller.addBanner)
admin_route.get('/editbanner',adminAuth.isLogin,admin_controller.loadEditBanner)
admin_route.post('/editbanner',adminAuth.isLogin,upload.array('image',1),admin_controller.updateBanner)

admin_route.get('/error',admin_controller.error)



module.exports= admin_route;