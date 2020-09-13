const express = require('express')
const { ensureAuth } = require('../auth')
const router = express.Router()
const Product = require('../models/Product')
const Cart = require('../models/Cart')

router.post('/add/cart/:id', ensureAuth, async (req,res) => {
    
    try {
        const check = await Cart.find({
          product:req.params.id,
          user:req.user.id,
          status:'cart',
        }).lean()
        if(check.length < 1){
          const cart = new Cart({
            user:req.user.id,
            product:req.params.id,
            quantity:req.body.quantity,
            })
            await cart.save()
            res.redirect('/purchase/cart')  
        } else {
            req.flash('success_msg','Already added to cart!!')
            return res.redirect('/sell/show')
        }
        
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard')
    }
})

router.get('/cart', ensureAuth, async(req,res) => {
    try {
        let total = 0,quantity = 0;
        let products = await Cart.find({user:req.user.id,status:'cart'}).populate('product').lean()
        products.forEach(cart => {
          cart.product.path = `data:${ cart.product.ProductImgType };charset=utf-8;base64,${ cart.product.ProductImg.toString('base64') }`
          cart.cost = cart.quantity*cart.product.price
          total += cart.cost
          quantity += cart.quantity
        })
        
       res.render('purchase/cart',{
           products:products,
           total:total,
           quantity,
       }) 
    } catch (error) {
        console.log(error)
        res.redirect('/sell/show')
    }
    
})

router.get('/show/product/:id',ensureAuth,async(req,res) => {
  let analysis = dateAdd()
  try {
    const carts = await Cart.find({product:req.params.id,status:'buy'})
                            .sort({ purchaseDate: 'desc'})
                            .populate('user')
                            .lean()   
    
    carts.forEach( cart => {
      analysis.forEach( data => {
        let formatPurchaseDate = cart.purchaseDate.toISOString().split('T')[0]
        let formatAnalysisDate = data.date.toISOString().split('T')[0]
        if(formatAnalysisDate == formatPurchaseDate){
          data.quantity = data.quantity + cart.quantity
        }
      })
    })

    analysis.forEach(data => {
      data.date = data.date.toISOString().split('T')[0]
    })

    const product = await Product.findById(req.params.id).lean()                         
    res.render('products/show',{
      carts:carts,
      product:product,
      analysis:analysis,
    })                           
  } catch (error) {
    console.log(error)
    res.redirect('/dashboard')
  }
})

router.put('/buy', ensureAuth, async (req, res) => {
  let products = await Cart.find({ user: req.user.id , status:'cart'}).populate('product').lean()
  
  try { 
    products.forEach(async cart => {
      let quantity = cart.product.quantity - cart.quantity
      await Product.updateOne({ _id: cart.product._id }, {quantity : quantity} , {
        new: true,
        runValidators: true,
      })
    })

    await Cart.updateMany({ user: req.user.id , status:'cart'}, {status:'buy',purchaseDate:Date.now()} , {
      new: true,
      runValidators: true,
    })
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    req.flash('error_msg','error buying items')
    res.redirect(`/purchase/cart`)
  }
})

router.delete('/:id', ensureAuth, async (req, res) => {
  // window.alert('Are you sure to delete this item?')  
  try {
      const product = await Cart.findById({ _id: req.params.id }).lean()
      if(product == null || product == undefined || product.length < 1){
        req.flash('error_msg','Product not found')
        return res.redirect('/dashboard')
      }
      // let product = await Cart.findById(req.params.id).lean()
      await Cart.deleteOne({ _id: req.params.id })
      res.redirect('/purchase/cart')
 
    } catch (err) {
      req.flash('error_msg',err)
      return res.redirect('/dashboard')
    }
})

const dateAdd = () => {
  let date = new Date()
  let max = date
  let analysis = []
  let min = 6
  while(min>=0){
    let mSeconds = max - (6-min)*86400000
    let newDate = new Date(mSeconds) 
    analysis.push({
      quantity:0,
      date:newDate,
    })
    min--  
  }
  return analysis
}

module.exports = router