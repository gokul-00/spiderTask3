const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    category:{
      type:String,
      required:true,
      default: 'general',
    },
    discount:{
      type:Number,
      default: 1,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    ProductImg:{
      type: Buffer,
      required:true
    },
    ProductImgType:{
      type: String,
      default: 'image/jpeg'
    },
  })

  
module.exports = mongoose.model('Product', ProductSchema)