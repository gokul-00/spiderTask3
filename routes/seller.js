const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../auth')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif','image/jpg']
const categories = [
  'Art & Crafts',
  'Beauty & Fashion',
  'cloths & Wearings',
  'Books',
  'Mobiles & Computers',
  'electronics',
  'sports',
  'home utilities',
  'Footwares',
  'software',
  'Toys & Games'
]

const Product = require('../models/Product')

// show add page

router.get('/add', ensureAuth, (req,res) => {
    res.render('products/add',{categories:categories})
})

// post add form

router.post('/add', ensureAuth, async (req, res) => {
  req.body.user = req.user.id
  const product = new Product({
    product_name: req.body.product_name,
    quantity:req.body.quantity,
    price:req.body.price,
    discount:req.body.discount,
    description:req.body.description,
    category:req.body.category,
    user:req.body.user,
  })  
  try {
      saveImg(product, req.body.ProductImg)
      await product.save()
      req.flash('success_msg', 'product added')
      res.redirect('/sell/show')
      
    } catch (err) {
      console.error(err)
      req.flash('error_msg', 'error adding product..')
      res.render('products/add')
      
    }
})

// show all products

router.get('/show', ensureAuth , async(req,res) => {
    let query = Product.find({})                  
    if (req.query.category != null && req.query.category != '') {
      query = query.regex('category', new RegExp(req.query.category, 'i'))
    }
    if (req.query.product_name != null && req.query.product_name != '') {
      query = query.regex('product_name', new RegExp(req.query.product_name, 'i'))
    }
    try {
    const products = await query.populate('user')
                                .sort({ createdAt: 'desc'})
                                .lean()
                                .exec()   
    if(products.length > 0){
      products.forEach(product => {
      product.path = `data:${ product.ProductImgType };charset=utf-8;base64,${ product.ProductImg.toString('base64') }`
      })
    }                        
    res.render('products/index',{
        products,
        status:req.user.status,
        categories,
        searchOptions: req.query,
    })
    }  catch (err) {
        console.error(err)
        res.redirect('/dashboard')
        req.flash('error_msg','error showing product')
    }                            
})

router.get('/edit/:id',ensureAuth, async(req,res) => {
  try {
  const product = await Product.findById(req.params.id).lean()
  product.path = `data:${ product.ProductImgType };charset=utf-8;base64,${ product.ProductImg.toString('base64') }`
  res.render('products/edit',{
    product:product,
    categories:categories,
  })
  req.flash('success_msg','update success!!')
  } catch(err){
    req.flash('error_msg',err)
    res.redirect('/dashboard')
  }
})

router.put('/edit/:id', ensureAuth, async (req, res) => {
  let product = await Product.findById(req.params.id).lean()
  try {
    product.product_name = req.body.product_name
    product.description = req.body.description
    product.price = req.body.price
    product.discount = req.body.discount
    product.category = req.body.category
    product.quantity = req.body.quantity
    product.createdAt = new Date()
    
    if(req.body.ProductImg != null && req.body.ProductImg != ''){
      saveImg(product, req.body.ProductImg)
    } 
    await Product.findOneAndUpdate({ _id: req.params.id }, product, {
      new: true,
      runValidators: true,
    })
    
    res.redirect('/sell/show')
  } catch (err) {
    console.log(err)
    req.flash('error_msg',err)
    res.redirect(`/sell/edit/${product._id}`)
  }
})

router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id).lean()

    if (!product) {
      req.flash('error_msg','Product not fount')
      return res.render('dashboard')
    }

    if (product.user != req.user.id) {
      res.redirect('/dashboard')
      req.flash('error_msg','Only product owner can delete product info')
    } else {
      await Product.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    req.flash('error_msg',err)
    return res.render('dashboard')
  }
})

function saveImg(product, imgEncoded) {
    if(imgEncoded == null) return
    const ProductImg = JSON.parse(imgEncoded)
    if(ProductImg !== null && imageMimeTypes.includes(ProductImg.type)){
      product.ProductImg = new Buffer.from(ProductImg.data,'base64')
      product.ProductImgType = ProductImg.type
    }
}

module.exports = router