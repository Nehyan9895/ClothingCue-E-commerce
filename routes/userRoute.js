const express = require('express');
const user_route = express();


//setting up view
user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser = require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))


const user_controller = require('../controller/userController');

user_route.get('/register',user_controller.loadRegister);
user_route.post('/register',user_controller.insertUser);

user_route.get('/otpVerification',user_controller.otpVerify);

module.exports = user_route;