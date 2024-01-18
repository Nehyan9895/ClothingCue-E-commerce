const User = require('../model/userModel');
const Category = require('../model/categoryModel')
const Products = require('../model/productModel')
const Order = require('../model/orderModel');
const Coupon = require('../model/couponModel');
const Banner = require('../model/bannerModel')
// const Variant = require('../model/variantModel')


const loadLogin =async(req,res)=>{
    try {
        const message = '';
        res.render('login',{message});
    } catch (error) {
        res.render('error')
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user  = await  User.findOne({email:email,password:password});
        if(user){
            if(user.is_admin===0){
                res.render('login',{message:'Email or password is incorrect'});
            }else{
                req.session.admin_id = user._id;
                res.redirect('/admin/home');
            }
        }else{
            res.render('login',{message:'email or password is incorrect'});
        }
    } catch (error) {
        res.redirect('/admin/error')
    }
}

const adminLogout = async (req, res) => {
    try {

       
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                  
                    res.redirect('/admin'); // Redirect to a different route after destroying the session
                }
            });
       
        

    } catch (error) {
        res.redirect('/admin/error')
    }
}

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById(req.session.admin_id );
        const user = await User.find({})
        const order = await Order.find({})
        const product = await Products.find({})
        const categories = await Category.find({});
        if (userData) {
            res.render('home', {admin:userData,order,user,product,categories });
        } else {
            // Handle the case where user data is not found
            res.redirect('/admin'); // Redirect to login page or appropriate page
        }
    } catch (error) {
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
    }
}

const editCategoryLoad = async (req,res)=>{
    try {
        const id = req.params.id;
    const categoryData = await Category.findOne({_id:id})
    if(categoryData){
        var message = '';
        res.render('editCategory',{categories:categoryData,message})
    }else{
        res.redirect('/admin/category')
    }
    } catch (error) {
        res.redirect('/admin/error')
    }
    
}

const editCategory = async(req,res)=>{
    try {
        const categoryId = req.body.id;
        const categories = await Category.findById(categoryId);
        const upperCaseName = req.body.name.toUpperCase();
        const existingCategory = await Category.findOne({name:upperCaseName});
         
        if(existingCategory){
            res.render('editCategory',{message:"Category with the same name already exists.",categories});
        }else{
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { name: upperCaseName, type: req.body.type, description: req.body.description } },
            { new: true } 
        );
        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/admin/category')
        }
       

       
    } catch (error) {
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
    }

}

const addProductLoad = async(req,res)=>{
    try {
        const categories = await Category.find({});
        const products  = await Products.find({sizes:req.body.sizes})
        
        res.render('addProduct',{categories,products});
    } catch (error) {
        // res.redirect('/admin/error')
        console.log(error.message);
    }
}

const addProduct = async (req, res) => {
    try {
        const name = req.body.name;
        const description = req.body.description;
        const regularPrice = req.body.regularPrice;
        const salesPrice = req.body.salesPrice;
        const category = req.body.category;
        const images = req.files ? req.files.map(file => file.path) : [];

        // Extract sizes and quantities from the request body
        const sizes = req.body.sizes.quantity;

        const product = new Products({
            name: name,
            description: description,
            regularPrice: regularPrice,
            salesPrice: salesPrice,
            category: category,
            images: images,
            sizes: [
                {
                    s: { quantity: sizes.s },
                    m: { quantity: sizes.m },
                    l: { quantity: sizes.l }
                }
            ]
        });

        await product.save();
        res.redirect('/admin/productList');
    } catch (error) {
        res.redirect('/admin/error')
    }
};


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
        res.redirect('/admin/error')
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
        res.redirect('/admin/error')
    }
}

const editProduct = async (req,res)=>{
    try {
        const productId = req.query.id;
        console.log(productId,'3241');
        const images = req.files ? req.files.map(file => file.path) : [];
        const sizes = req.body.sizes.quantity;
        console.log(sizes,'afds');
        const category = req.body.category;
        console.log(category,'categ');
        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            { $set: {
                 name: req.body.name,
                 description: req.body.description,
                 regularPrice: req.body.regularPrice,
                 salesPrice:req.body.salesPrice,
                 category:category,
                 images:images,
                 sizes: [
                    {
                        s: { quantity: sizes.s },
                        m: { quantity: sizes.m },
                        l: { quantity: sizes.l }
                    }
                ]
                } },
            { new: true } 
        );
        if (!updatedProduct) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/admin/productList');
    } catch (error) {
        // res.redirect('/admin/error')
        console.log(error.message);
    }
}

const loadSalesReport =  async(req,res)=>{
    try {
        const orders=await Order.find({})
        .populate('products.productId')
        .populate('userId');
        const totalAmount =  await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'Success'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: { $toDouble: "$totalAmount" } }
                }
            }
        ]);
         
        res.render('salesReport',{orders,totalAmount})

    } catch (error) {
        res.redirect('/admin/error')
    }
}

const searchSalesReport = async (req,res)=>{
    try {
        const start = req.body.start;
        const end = req.body.end;
        const orders = await Order.find({
            orderDate:{
                $gte:new Date(start),
                $lte:new Date(end)
            }
        }).populate('products.productId').populate('userId')
        res.render('salesReport',{orders,start,end});
    } catch (error) {
        res.redirect('/admin/error')
    }
}

// const loadVariantPage = async(req,res)=>{
//     try {
//         const variant = await Variant.find({})
//         var message = ' ';
//         res.render('variant',{variant,message});;
//     } catch (error) {
//         res.redirect('/admin/error')
//     }
// }

// const addVariant = async(req,res)=>{
//     try {
//         const variant = await Variant.find({});
//         const upperCaseName = req.body.name.toUpperCase();

//         const existingVariant = await Variant.findOne({name:upperCaseName})
//         if(existingVariant){
//             res.render('variant',{message:"Variant with the same name is already exists",variant})
//         }else{
//             const newVariant = new Variant({
//                 name:upperCaseName,
//                 quantity:req.body.quantity,
//             })
//             await newVariant.save();
//             res.redirect('/admin/variant');
//         }
//     } catch (error) {
//         res.redirect('/admin/error')
//     }
// }

// const blockVariant = async(req,res)=>{
//     try {
//         const variantId = req.query.variantId;
//         const message = ' ';
//         const act = req.query.act=='true';
//         const variant = await Variant.findById(variantId);

//         if (!variant) {
//             return res.status(404).send('User not found');
//         }
//         if(act){
//             variant.variantStatus =  true;
          
//         }else{
//             variant.variantStatus = false;
//         }
        
//         await variant.save();

//         const updatedVariant = await Variant.find({});

//         res.render('variant',{variant:updatedVariant,message});
//     } catch (error) {
//         res.redirect('/admin/error')
//     }
// }

const loadCoupon = async (req,res)=>{
    try {
        let msg = req.query.msg = 'true';
        const coupons = await Coupon.find({});
        res.render('coupon',{coupons,msg});
    } catch (error) {
        console.log(error.message);
    }
}
const addCoupon = async (req,res)=>{
    try {
        const couponCode = req.body.code.replace(/\s/g, '').trim().toUpperCase();
        const date = req.body.expirydate;
        const status = req.body.status === 'Active';
        const discount = req.body.discount;
        const limit = req.body.limit;
        const description = req.body.description;
        

        const existingCoupon = await Coupon.find({couponCode:couponCode});

        if(existingCoupon.length>0){
            res.redirect(`/admin/coupon?msg=true`);
        }else{
            const coupon = new Coupon({
                couponCode:couponCode,
                discount:discount,
                status:status,
                limit:limit,
                expiryDate:date,
                description:description,

            })
            const couponData = await coupon.save();
            if(couponData){
                res.redirect('/admin/coupon')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCoupon = async(req,res)=>{
    try {
        const couponId = req.query.couponId;
        const coupons = await Coupon.findById(couponId);
        const coupon = await Coupon.find({});

        res.render('editCoupon',{coupon,coupons,msg:false})

    } catch (error) {
        console.log(error.message);
    }
}

const updateCoupon = async(req,res)=>{
    try {
        const couponId = req.query.couponId;
        const status = req.body.status === 'Active';

        const CouponUpdate = {
            couponCode: req.body.code.toUpperCase(),
            expiryDate:req.body.expiryDate,
            status:status,
            discount: req.body.discount,
            limit: req.body.limit,
            description:req.body.description
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId,CouponUpdate,{new:true});
        if(updatedCoupon){
            res.redirect('/admin/coupon?msg=false')
          }else{
            res.redirect('/admin/error')
          }
    } catch (error) {
        console.log(error.message);
    }
}

const banners = async(req,res)=>{
    try {
        const banner = await Banner.find({});
        res.render('banner',{banner})
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async(req,res)=>{
    try {
        const name = req.body.name;
        const image = req.files.map(file=>file.path);
        const title1 = req.body.title1;
        const title2 = req.body.title2;
        const title3 = req.body.title3;
        const title4 = req.body.title4;
        
        const newBanner = new Banner({
            name:name,
            image:image[0],
            title1:title1,
            title2:title2,
            title3:title3,
            title4:title4
        })

        const savedBanner = await newBanner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditBanner = async(req,res)=>{
    try {
        const bannerId = req.query.bannerId;
        const editBanner = await Banner.findById(bannerId);
        const banners = await Banner.find({});
        
        res.render('editBanner',{banner:editBanner,banners})
    } catch (error) {
        console.log(error.message);
    }
}



const error = async(req,res)=>{
    try {
        res.render('error');
    } catch (error) {
        console.log(error.message);
    }
}

const updateBanner = async(req,res)=>{
    try {
        const bannerId = req.body.Id;
        const name = req.body.name;
        const image = req.files.map(file=>file.path);
        const title1 = req.body.title1;
        const title2 = req.body.title2;
        const title3 = req.body.title3;
        const title4 = req.body.title4;

        const updateBannerData = {
            name:name,
            image:image[0],
            title1:title1,
            title2:title2,
            title3:title3,
            title4:title4,
        }
        await Banner.findByIdAndUpdate(bannerId,updateBannerData)
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
    }
}




module.exports={
    loadLogin,
    verifyLogin,
    adminLogout,
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
    editProduct,
    loadSalesReport,
    searchSalesReport,
    // loadVariantPage,
    // addVariant,
    // blockVariant,
    loadCoupon,
    addCoupon,
    loadEditCoupon,
    updateCoupon,
    banners,
    addBanner,
    loadEditBanner,
    updateBanner,
    error,
    
}