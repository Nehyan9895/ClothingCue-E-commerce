const express = require('express');
const user_route = express();


//setting up view
user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser = require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))


const user_controller = require('../controller/userController');


//for register page
user_route.get('/register',user_controller.loadRegister);
user_route.post('/register',user_controller.insertUser);

//for otp verifying page
user_route.post('/verify',user_controller.otpVerify);

//for login page
user_route.get('/',user_controller.loginLoad);
user_route.get('/login',user_controller.loginLoad);
user_route.post('/login',user_controller.verifyLogin);

//for loading home page
user_route.get('/home',user_controller.loadHome)

module.exports = user_route;