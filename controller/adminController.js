const User = require('../model/userModel');
const Category = require('../model/categoryModel')


const loadLogin =async(req,res)=>{
    try {
        const message = '';
        res.render('login',{message});
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findById(req.session.user_id );
        const user  = await  User.findOne({email:email,password:password});
        if(user){
            if(user.is_admin===0){
                res.render('login',{message:'Email or password is incorrect'});
            }else{
                req.session.user_id = user._id;
                res.redirect('/admin/home');
            }
        }else{
            res.render('login',{message:'email or password is incorrect'});
        }
    } catch (error) {
        console.log(error.message);        
    }
}

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id );
        if (userData) {
            res.render('home', { admin: userData });
        } else {
            // Handle the case where user data is not found
            res.redirect('/admin'); // Redirect to login page or appropriate page
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        var search = '';
        if(req.query.search){
            search = req.query.search;
           
        } 
        const userData = await User.find({})
        res.render('UsersList',{users:userData});
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async(req,res)=>{
    
    try {
        const userId = req.query.userId;
      
        const act =req.query.act==1;
        console.log(act);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }
        if(act){
            user.is_verified =  1;
          
        }else{
            user.is_verified = 0;
        }
        

        await user.save();

        const updatedUsers  = await User.find({})

        console.log(updatedUsers);
        res.render('UsersList',{users:updatedUsers})

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const loadCategories = async(req,res)=>{
    
    try {
        const categories= await Category.find({})
        var search = '';
    if(req.query.search){
        search=req.query.search;
    }
    res.render('category',{categories})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    try {
        const category = new Category({
            name:req.body.name,
            type:req.body.type,
            description:req.body.description
        })
              await category.save();
             
       
            res.redirect('/category')
        
        
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    loadLogin,
    verifyLogin,
    loadHome,
    loadDashboard,
    blockUser,
    loadCategories,
    addCategory
}