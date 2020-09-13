const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    quantity:{
        type: Number,
        default:1,
    },
    status:{
        type: String,
        enum: ['buy','cart'],
        default: 'cart',
    },
    purchaseDate:{
        type: Date,
        default: Date.now(),
    }
})

module.exports = mongoose.model( 'Cart' , CartSchema )