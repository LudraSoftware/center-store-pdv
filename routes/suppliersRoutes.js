const express = require('express');
const db = require('../models'); // Importa o banco de dados corretamente
const { ensureAuthenticated, ensureAdmin  } = require('../middlewares/auth');

const router = express.Router();

// Listar todos os fornecedores
router.get('/suppliers', ensureAuthenticated, ensureAdmin , async(req, res) => {
  try {
    const suppliers = await db.Supplier.findAll();
    res.render('suppliers/list', { suppliers, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao listar fornecedores:', err);
    req.flash('error', 'Erro ao listar fornecedores.');
    res.redirect('/');
  }
});

// Página de cadastro de fornecedor
router.get('/suppliers/new', (req, res) => {
  res.render('suppliers/new', { messageError: req.flash('error'), messageSuccess: req.flash('success') });
});

// Cadastro de fornecedor
router.post('/suppliers', ensureAuthenticated, ensureAdmin , async(req, res) => {
  const { name } = req.body;
  try {
    await db.Supplier.create({ name });
    req.flash('success', 'Fornecedor cadastrado com sucesso!');
    res.redirect('/suppliers');
  } catch (err) {
    console.error('❌ Erro ao cadastrar fornecedor:', err);
    req.flash('error', 'Erro ao cadastrar fornecedor.');
    res.redirect('/suppliers/new');
  }
});

// Página de edição de fornecedor
router.get('/suppliers/edit/:id', ensureAuthenticated, ensureAdmin , async(req, res) => {
  try {
    const supplier = await db.Supplier.findByPk(req.params.id);
    if (!supplier) {
      req.flash('error', 'Fornecedor não encontrado!');
      return res.redirect('/suppliers');
    }
    res.render('suppliers/edit', { supplier, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao buscar fornecedor:', err);
    req.flash('error', 'Erro ao buscar fornecedor.');
    res.redirect('/suppliers');
  }
});

// Atualização de fornecedor
router.post('/suppliers/edit/:id', ensureAuthenticated, ensureAdmin , async(req, res) => {
  const { name } = req.body;
  try {
    const supplier = await db.Supplier.findByPk(req.params.id);
    if (!supplier) {
      req.flash('error', 'Fornecedor não encontrado!');
      return res.redirect('/suppliers');
    }
    await supplier.update({ name });
    req.flash('success', 'Fornecedor atualizado com sucesso!');
    res.redirect('/suppliers');
  } catch (err) {
    console.error('❌ Erro ao atualizar fornecedor:', err);
    req.flash('error', 'Erro ao atualizar fornecedor.');
    res.redirect(`/suppliers/edit/${req.params.id}`);
  }
});

// Exclusão de fornecedor
router.post('/suppliers/delete/:id', ensureAuthenticated, ensureAdmin , async(req, res) => {
  try {
    const supplier = await db.Supplier.findByPk(req.params.id);
    if (!supplier) {
      req.flash('error', 'Fornecedor não encontrado!');
      return res.redirect('/suppliers');
    }
    await supplier.destroy();
    req.flash('success', 'Fornecedor excluído com sucesso!');
    res.redirect('/suppliers');
  } catch (err) {
    console.error('❌ Erro ao excluir fornecedor:', err);
    req.flash('error', 'Erro ao excluir fornecedor.');
    res.redirect('/suppliers');
  }
});

module.exports = router;
