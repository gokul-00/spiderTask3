const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../auth');

const Product = require('../models/Product')
const Cart = require('../models/Cart')

let recentPurchase = []
// Dashboard
router.get('/', ensureGuest , (req, res) => res.render('index'));

router.get('/dashboard', ensureAuth , async(req, res) => {
  const products = await Product.find({user:req.user._id})
                                .populate('user')
                                .sort({ createdAt: 'desc'})
                                .lean()    
  const carts = await Cart.find({user:req.user._id,status:'buy'})
                          .populate('product') 
                          .sort({ purchaseDate: 'desc'})
                          .lean()         
  carts.forEach(cart => {
    if(carts[0].purchaseDate == cart.purchaseDate){
      recentPurchase.push(cart)
    }else {
      return recentPurchase
    }
  })                        
                          
  try{     
    res.render('dashboard', {
      user: req.user,
      products: products,
      carts:carts,
      recentPurchase:recentPurchase,
    })
    
  }  catch (err) {
      console.error(err)
      res.redirect('/dashboard')
      req.flash('error_msg','error showing product')
  } 
}  
);

module.exports = router;
