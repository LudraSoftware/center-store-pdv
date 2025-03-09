const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { User } = require('../models');

const router = express.Router();

router.get('/login', (req, res) => res.render('login', { message: req.flash('error') }));

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
  const { name, email, password, type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hashedPassword, type });
    req.flash('success', 'Cadastro realizado com sucesso! Faça login.');
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register');
  }
});

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Você precisa estar logado!');
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

module.exports = router;
