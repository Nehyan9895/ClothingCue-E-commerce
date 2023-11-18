const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/E-commerce');
const path = require('path');

const express= require('express');
const app= express();

app.use('/static', express.static(path.join(__dirname, 'public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

//for user Route
const userRoute= require('./routes/userRoute'); 
app.use('/',userRoute);


app.listen(7000,()=>{
    console.log('Server Started...');
})