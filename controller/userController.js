const User = require('../model/userModel');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { error } = require('console');
const userModel = require('../model/userModel');


 function sendVerificationCode (name, email,req,res)  {
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
        const generateVerificationCode = () => {
            return Math.floor(1000 + Math.random() * 9000).toString();
        }
        //send verification code
        const verificationCode = generateVerificationCode();
        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'Verification code',
            html: `<p>Hi ${name}, Your Verification code to sign up in Clothing Cue is ${verificationCode}.</p>`,
        };
     
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email Sent: ' + info.response);
                req.session.otp = verificationCode
            res.render('otpPage',{message:""});
            }
        })


    } catch (error) {
        console.log(error.message);
    }
};


//to load registration page
const loadRegister = async (req, res) => {
    try {
        const message = '';
        res.render('registration',{message:""});
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({email:req.body.email});
        if(existingUser){
            res.render('registration',{message:"this email is already exist."})
        }


        console.log(req.body);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            is_verified: 0 //initialize as zero and get one after verificaton
        });
        req.session.user = req.body;

        if (req.session.user) {
             sendVerificationCode(req.body.name, req.body.email,req,res)
            
        } else {
            res.render('registration', { message: "Your registration has been failed..." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req, res) => {
    try {
        console.log(req.body)
        console.log(req.session.otp, req.body.otp,req.session.user);

        if (req.body.otp === req.session.otp) {
            await userModel.insertMany(req.session.user);
            res.render('homePage');
        }else{
            res.render('otpPage',{message:"Incorrect otp pin"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loginLoad = async (req,res)=>{
    try {
        const message = '';
        res.render('login',{message});
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email,password:password})
        if(userData){
            req.session.user_id = userData._id;
            res.redirect('/home');
        }else{
            res.render('login',{message:"Email or password is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req, res)=>{

    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('homePage',{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    loadRegister,
    insertUser,
    otpVerify,
    loginLoad,
    verifyLogin,
    loadHome
}