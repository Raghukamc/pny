const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');
const randomstring = require('randomstring');
const mailer = require('../misc/mailer');
var store = require('store');
const User = require('../models/user');
const Log = require('../models/log');
var localStorage = require('localStorage');
var app = express();

// Validation Schema
const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  lastname: Joi.string().required(),
  location: Joi.string().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});

// Authorization 
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error', 'Sorry, but you must be registered first!');
    res.redirect('/');
  }
};



const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash('error', 'Sorry, but you are already logged in!');
    res.redirect('/');
  } else {
    return next();
  }
};

router.route('/register')
  .get(isNotAuthenticated, (req, res) => {
    res.render('register');
  })
  .post(async (req, res, next) => {
    try {
      const result = Joi.validate(req.body, userSchema);
      if (result.error) {
        req.flash('error', 'Data is not valid. Please try again.');
        res.redirect('/users/register');
        return;
      }

      // Checking if email is already taken
      const user = await User.findOne({ 'email': result.value.email });
      if (user) {
        
        req.flash('error', 'Email is already in use.');
        res.redirect('/users/register');
        return;
      }

      // Hash the password
      const hash = await User.hashPassword(result.value.password);
      
      // Generate secret token
      const secretToken = randomstring.generate();
      //console.log('secretToken', secretToken);

      // Save secret token to the DB
      result.value.secretToken = secretToken;

      // Flag account as inactive
      result.value.active = false;

      // Save user to DB
      delete result.value.confirmationPassword;
      result.value.password = hash;

      const newUser = await new User(result.value); 
      //console.log('newUser', newUser);
      await newUser.save();
      
      link="http://"+req.get('host')+"/users/confirm?id="+secretToken;
      // Compose email
      const html = `Hi there,
      <br/>
      Thank you for registering!
      <br/><br/>
      Please verify your email by typing the following token:
      <br/>
      Token: <b>${secretToken}</b>
      <br/>
      On the following page:
      <a href=`+link+`>Click here to Confirm</a>
      <br/><br/>
      Have a pleasant day.` 

      // Send email
      await mailer.sendEmail('admin@codeworkrsite.com', result.value.email, 'Please verify your email!', html);

      req.flash('success', 'Please check your email.');
      res.redirect('/users/login');
    } catch(error) {
      next(error);
    }
  });

router.route('/login')
  .get(isNotAuthenticated, (req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }));



  const userSchema1 = Joi.object().keys({
    email: Joi.string().email().required()
  });

  router.route('/forgot')
  .get(isNotAuthenticated, (req, res) => {
    res.render('forgot');
  })
  .post(async (req, res, next) => {
    try {
      const result = Joi.validate(req.body, userSchema1);
      if (result.error) {
        req.flash('error', 'Enter valid Email address.');
        res.redirect('/users/forgot');
        return;
      }
       // Generate secret token
       const secretToken = randomstring.generate();
       //console.log('secretToken', secretToken);
       host=req.get('host');
      // Checking if email is already taken
      const user = await User.findOneAndUpdate({ 'email': result.value.email },{'secretToken':secretToken,'active':false});
      const log = await Log.findOneAndUpdate({ 'status': "true" },{'log':"raghuk",'log_type':"krishnappa"});
      if(!log){
        req.flash('error', 'error.');
        res.redirect('/users/login');
      }
      if (!user) {
        req.flash('error', 'Email id  not exist, Enter valid email.');
        res.redirect('/users/forgot');
        return;
      }
     
     
     link="http://"+req.get('host')+"/users/reset?id="+secretToken;

      // Compose email
      const html = `Hi there,
      <br/>
      Thank you for registering!
      <br/><br/>
      Please verify your email by typing the following token:
      <br/>
      Token: <b>${secretToken}</b>
      <br/>
      On the following page:
      <a href=`+link+`>Click here to verify</a>
      <br/><br/>
      Have a pleasant day.` 

      // Send email
      await mailer.sendEmail('admin@codeworkrsite.com', result.value.email, 'Please verify your email!', html);
      module.exports = secretToken;
      req.flash('success', 'Please check your email.');
      res.redirect('/users/forgot');
    } catch(error) {
      next(error);
    }
  });

  

  router.route('/reset1')
  .get(isNotAuthenticated, (req, res) => {
    res.render('reset');
  })
  .post(async (req, res, next) => {
    try {
      const result = Joi.validate(req.body, userSchema2);
      if (result.error) {
        req.flash('error', 'password not match.');
        res.redirect('/users/reset');
        return;
      }
        myValue = JSON.parse(localStorage.getItem('email'));
        console.log(myValue);
        Email = myValue.Email;

      // Checking if email is already taken
      const hash = await User.hashPassword(result.value.password);
      const user = await User.findOneAndUpdate({ 'email': Email },{'password':hash});
      if (!user) {
        req.flash('error', 'Invalid password');
        res.redirect('/users/forgot');
        return;
      }
     
     
      req.flash('success', 'Password updated please Login.');
      res.redirect('/users/login');
    } catch(error) {
      next(error);
    }
  });
  



    const userSchema2 = Joi.object().keys({
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
  });

router.route('/reset')
  .get(isNotAuthenticated,(req, res) => {
    
    token = req.query.id;
    var str = JSON.stringify({token: req.query.id});
    localStorage.setItem('Token',str);
    
    console.log(token);
    res.render('reset');
  })
  .post(async (req, res, next) => {
    try {

      myValue = JSON.parse(localStorage.getItem('Token'));
      
     
     token = myValue.token;
     console.log(token);
     const user = await User.findOne({ 'secretToken': token });
      if (!user) {
        req.flash('error', 'Link Expired.');
        res.redirect('/users/forgot');
        return;
      }
     console.log(user.active);

      const result = Joi.validate(req.body, userSchema2);
      if (result.error) {
        req.flash('error', 'password not match.');
        res.redirect('/users/reset');
        return;
      }
        
      // Checking if email is already taken
      const hash = await User.hashPassword(result.value.password);
      user.password = hash;
      user.active = true;
      user.secretToken = '';
      await user.save();

      req.flash('success', 'Thank you! Login with new password.');
      res.redirect('/users/login'); 
    } catch(error) {
      next(error);
    }
  })

//Account confirmation
  router.route('/confirm')
  .get(isNotAuthenticated,(req, res) => {
    
    token = req.query.id;
    var str = JSON.stringify({token: req.query.id});
    localStorage.setItem('Token',str);
    
    console.log(token);
    res.render('confirm');
  })
  .post(async (req, res, next) => {
    try {

      myValue = JSON.parse(localStorage.getItem('Token'));
      
     
     token = myValue.token;
     console.log(token);
     const user = await User.findOne({ 'secretToken': token });
      if (!user) {
        req.flash('error', 'Link expired,Please Login');
        res.redirect('/users/login');
        return;
      }
    // console.log(user.active);
    // Checking if email is already taken
      
      user.active = true;
      user.secretToken = '';
      await user.save();

      req.flash('success', 'Account confirmed, Please login with your credentials.');
      res.redirect('/users/login'); 
    } catch(error) {
      next(error);
    }
  })

     
    /*--------------------Routing Over----------------------------*/
    router.route('/dashboard')
  .get(isAuthenticated, (req, res) => {
    res.render('dashboard', {
      username: req.user.username,
      password: req.user.password,
    });
  });

router.route('/logout')
  .get(isAuthenticated, (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out. Hope to see you soon!');
    res.redirect('/');
  });



module.exports = router;