const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      status: {
        type: String,
        default: 'customer',
        enum: ['customer','seller']
      },
      date: {
        type: Date,
        default: Date.now
      }
    
})


module.exports = mongoose.model('User',UserSchema);