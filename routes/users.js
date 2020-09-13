const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { ensureGuest } = require('../auth');
const { localsName } = require('ejs');

// Login Page
router.get('/login', ensureGuest, (req, res) => res.render('users/login'));

// Register Page
router.get('/register', ensureGuest, (req, res) => res.render('users/register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, status, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !status || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (!password.match(/((^[0-9]+[a-z]+)||(^[a-z]+[0-9]+))+[0-9a-z]+$/i)) {
    errors.push({ msg: 'password must be Alphanumeric'})
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('users/register', {
          errors,
          name,
          email,
          status,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          status,
          password
        });
      User.findOne({ name: name}).then(user => {
        if (user) {
          errors.push({ msg: 'User name already exists' });
          res.render('users/register', {
            errors,
            name,
            email,
            status,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            status,
            password
          });    
        }
      })
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
  req.flash('success_msg','welcome to E-Kart!!!')
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
