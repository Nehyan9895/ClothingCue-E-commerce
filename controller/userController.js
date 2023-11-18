const User = require('../model/userModel');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { error } = require('console');


const sendVerificationCode = async (name, email) => {
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
        const generateVerificationCode = () =>{
            return Math.floor(1000+Math.random()*9000).toString();
        }
        //send verification code
            const verificationCode = generateVerificationCode();
            const mailOption ={
                from :config.emailUser,
                to : email,
                subject : 'Verification code',
                html: `<p>Hi ${name}, Your Verification code to sign up in Clothing Cue is ${verificationCode}.</p>`,
            };
            transporter.sendMail(mailOption,(error,info)=>{
                if (error) {
                    console.log(error);
                }else{
                    console.log('Email Sent: ' +info.response );
                }
            })
        

    } catch (error) {
        console.log(error.message);
    }
};


//to load registration page
const loadRegister = async (req,res)=>{
    try {
        const message = '';
        res.render('registration',{message});
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req,res)=>{
    try {
        console.log(req.body);
        const user = new User({
            name : req.body.name,
            email : req.body.email,
            mobile : req.body.mobile,
            password : req.body.password[0],
            is_verified:0 //initialize as zero and get one after verificaton
        });
        const userData = await user.save(); //await the save operation
        
        if(userData){
            sendVerificationCode(req.body.name,req.body.email);
            res.render('otpPage');
        }else{
            res.render('registration', { message:"Your registration has been failed..." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req,res)=>{
    try {
            //update the user's if it is otp verified 
            const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
            console.log(updateInfo);
            res.render('otpPage'); 
    } catch (error) {
        console.log(error.message);
    }
}




module.exports={
    loadRegister,
    sendVerificationCode,
    insertUser,
    otpVerify
}