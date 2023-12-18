const User = require('../model/userModel');
const Category = require('../model/categoryModel')
const Products = require('../model/productModel')
const Order = require('../model/orderModel');


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
        var message = '';
    if(req.query.search){
        search=req.query.search;
    }
    res.render('category',{categories,message})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    try {
        const categories= await Category.find({})
        const upperCaseName =req.body.name.toUpperCase();
        
        const existingCategory = await Category.findOne({name:upperCaseName});
        if(existingCategory){
            res.render('category',{message:"Category with the same name already exists.",categories});
        }
        else{
            const category = new Category({
                name:upperCaseName,
                type:req.body.type,
                description:req.body.description
            })
                  await category.save();
                 
           
                res.redirect('/admin/category')
            
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const blockCategories = async(req,res)=>{
    
    try {
        const categoryId = req.query.categoryId;
        const message='';
        const act =req.query.act=='true';
        console.log(act);
        const categories = await Category.findById(categoryId);

        if (!categories) {
            return res.status(404).send('User not found');
        }
        if(act){
            categories.status =  true;
          
        }else{
            categories.status = false;
        }
        

        await categories.save();

        const updatedCategories  = await Category.find({})

        res.render('category',{categories:updatedCategories,message})

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editCategoryLoad = async (req,res)=>{
    try {
        const id = req.params.id;
    const categoryData = await Category.findOne({_id:id})
    if(categoryData){
        res.render('editCategory',{categories:categoryData})
    }else{
        res.redirect('/admin/category')
    }
    } catch (error) {
        console.log(error.message);
    }
    
}

const editCategory = async(req,res)=>{
    try {
        const categoryId = req.body.id;
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { name: req.body.name, type: req.body.type, description: req.body.description } },
            { new: true } 
        );
        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/category')
    } catch (error) {
        console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    }
}
const loadProductList = async(req,res)=>{
    try {
        const id = req.body.id;
        const products = await Products.find({});
        const status = await Products.find({status:req.body.status});
        var search = '';
        if(req.query.search){
            search = req.query.search;
        }
        res.render('productList',{products,status});
    } catch (error) {
        console.log(error.message);
    }

}

const addProductLoad = async(req,res)=>{
    try {
        const categories = await Category.find({});
        const products  = await Products.find({sizes:req.body.sizes})
        
        res.render('addProduct',{categories,products});
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async(req,res)=>{
    try {
        const name = req.body.name;
        const description = req.body.description;
        const regularPrice = req.body.regularPrice;
        const salesPrice = req.body.salesPrice;
        const totalStock = req.body.totalStock;
        const images = req.files ? req.files.map(file => file.path) : [];
        const sizes = req.body.sizes.map(size => ({ size: size.size, quantity: size.quantity }));


        const products = new Products({
            name:name,
            description:description,
            regularPrice:regularPrice,
            salesPrice:salesPrice,
            totalStock:totalStock,
            images:images,
            sizes:sizes
        })

        await products.save();
        res.redirect('/admin/productList');

    } catch (error) {
        console.log(error.message);
    }
}

const blockProduct = async(req,res)=>{
    
    try {
        const productId = req.query.ProductId;
        console.log(productId);
        const act =req.query.act=='true';
        console.log(act);
        const products = await Products.findById(productId);
        console.log(products);

        if (!products) {
            return res.status(404).send('User not found');
        }
        if(act){
            products.status =  true;
          
        }else{
            products.status = false;
        }
        

        await products.save();


        res.redirect('/admin/productList')

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editProductLoad  = async(req,res)=>{
    try {       
        const images = await Products.distinct('images');
         const categories = await Category.find({});
        const id = req.query.id;
        const productData = await Products.findOne({_id:id});
        if(productData){
            res.render('editProduct',{products:productData,images,categories})
        }else{
            res.redirect('/admin/productList')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req,res)=>{
    try {
        const productId = req.body.id;
        const images = req.files ? req.files.map(file => file.path) : [];
        const sizes = req.body.sizes.map(size => ({ size: size.size, quantity: size.quantity }));
        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            { $set: {
                 name: req.body.name,
                 description: req.body.description,
                 regularPrice: req.body.regularPrice,
                 salesPrice:req.body.salesPrice,
                 totalStock:req.body.totalStock,
                 images:images,
                 sizes:sizes
                } },
            { new: true } 
        );
        if (!updatedProduct) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/admin/productList');
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
    addCategory,
    blockCategories,
    editCategory,
    editCategoryLoad,
    loadProductList,
    addProductLoad,
    addProduct,
    blockProduct,
    editProductLoad,
    editProduct
}