const express = require('express');
const admin_route = express();
const session = require("express-session");
const config = require('../config/config');


const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')

admin_controller = require('../controller/adminController');

admin_route.get('/',admin_controller.loadLogin);
admin_route.post('/',admin_controller.verifyLogin);

admin_route.get('/home',admin_controller.loadHome)

admin_route.get('/UsersList',admin_controller.loadDashboard)
admin_route.get('/blockUser',admin_controller.blockUser)

admin_route.get('/category',admin_controller.loadCategories)
admin_route.post('/category',admin_controller.addCategory)





module.exports= admin_route;