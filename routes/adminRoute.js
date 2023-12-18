const express = require('express');
const admin_route = express();
const session = require("express-session");
const config = require('../config/config');
const multer = require('multer');




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

admin_route.get('/home',admin_controller.loadHome)

admin_route.get('/UsersList',admin_controller.loadDashboard)
admin_route.get('/blockUser',admin_controller.blockUser)

admin_route.get('/category',admin_controller.loadCategories)
admin_route.post('/category',admin_controller.addCategory)

admin_route.get('/blockCategories',admin_controller.blockCategories)

admin_route.get('/editCategory/:id',admin_controller.editCategoryLoad);
admin_route.post('/editCategory/:id',admin_controller.editCategory)

admin_route.get('/productList',admin_controller.loadProductList);
admin_route.get('/addProduct',admin_controller.addProductLoad);

admin_route.post('/addProduct',upload.array('images',5),admin_controller.addProduct);

admin_route.get('/blockProduct',admin_controller.blockProduct);
admin_route.get('/editProduct',admin_controller.editProductLoad)

admin_route.post('/editProduct',upload.array('images',5),admin_controller.editProduct)
admin_route.get('/orderlist',order_controller.loadOrderList);
admin_route.get('/orderdetails',order_controller.loadOrderDetails)
admin_route.get('/cancelorder',order_controller.userCancelOrder);



module.exports= admin_route;