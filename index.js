require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
const path = require('path');
const express= require('express');
const app= express();
const config = require('./config/config')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

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
app.use('/static', express.static(path.join(__dirname, 'public/admin-assets')));
app.use('/uploads', express.static('uploads'));



//for user Route
const userRoute= require('./routes/userRoute'); 
app.use('/',userRoute);


//for admin Route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(7000,()=>{
    console.log('Server Started...');
})