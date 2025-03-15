require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../models"); // Importa o banco de dados corretamente

const router = express.Router();

router.get("/", (req, res) => res.redirect("/dashboard"))

// Página de login
router.get("/login", (req, res) =>
  res.render("login", {
    messageError: req.flash("error"),
    messageSuccess: req.flash("success"),
    layout: false,Name: process.env.EMPLOYMENT_NAME
  })
);

// Autenticação do login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Página de registro
router.get("/register", (req, res) =>
  res.render("register", {
    messageError: req.flash("error"),
    messageSuccess: req.flash("success"),
    layout: false,
  })
);

// Registro de usuário
router.post("/register", async (req, res) => {
  const { name, email, password, type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Verifica se o email já existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      req.flash("error", "E-mail já cadastrado! Tente outro.");
      return res.redirect("/register");
    }

    await db.User.create({ name, email, password: hashedPassword, type });
    req.flash("success", "Cadastro realizado com sucesso! Faça login.");
    res.redirect("/login");
  } catch (err) {
    console.error("❌ Erro ao cadastrar usuário:", err);
    req.flash(
      "error",
      "Erro ao cadastrar usuário. Verifique os dados e tente novamente."
    );
    res.redirect("/register");
  }
});

// Página de dashboard (somente autenticado)
router.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    user: req.user,
    messageError: req.flash("error"),
    messageSuccess: req.flash("success"),
    currentPage: 'dashboard'
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logout realizado com sucesso!");
    res.redirect("/login");
  });
});

module.exports = router;
