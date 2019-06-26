var express = require('express');
var router = express.Router();
var passportTwitter = require('../auth/twitter');
var passportGoogle = require('../auth/google');
var passportGitHub = require('../auth/github');

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Please Sign In with:' });
});

router.get('/google',
  passportGoogle.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });