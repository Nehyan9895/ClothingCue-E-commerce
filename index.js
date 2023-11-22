const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/E-commerce');
const path = require('path');
const express= require('express');
const app= express();
const config = require('../My project/config/config')

const session = require('express-session');
app.use(session({
    saveUninitialized:false,
    resave:true,
    secret:config.sessionSecret,
    cookie:{
        maxAge:60*1000*60*10
    }
}))



app.use('/static', express.static(path.join(__dirname, 'public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/admin-assets', express.static(path.join(__dirname, 'public/admin-assets')));


//for user Route
const userRoute= require('./routes/userRoute'); 
app.use('/',userRoute);


//for admin Route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(7001,()=>{
    console.log('Server Started...');
})