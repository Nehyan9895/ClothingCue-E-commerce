const User = require('../model/userModel');

const isBlocked = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            const user = await User.findById(req.session.user_id);
            if(user.is_verified==1){
                next();
            }else{
                req.session.destroy((err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/login')
                    }
                })
            }
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home');
            return;
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLogin = async(req,res,next)=>{
    try{
    if(req.session.user_id){
        next();
    }else{
        res.redirect('/login')
    }
}catch(error){
    console.log(error.message);
}
}

module.exports={
    isBlocked,
    isLogout,
    isLogin
}