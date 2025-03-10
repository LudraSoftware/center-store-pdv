const express = require('express');
const db = require('../models'); // Importa o banco de dados corretamente
const { ensureAuthenticated, ensureAdmin  } = require('../middlewares/auth');

const router = express.Router();

// Listar todos os produtos
router.get('/products', ensureAuthenticated, ensureAdmin , async (req, res) => {
  try {
    const products = await db.Product.findAll({ include: db.Supplier });
    res.render('products/list', { products, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao listar produtos:', err);
    req.flash('error', 'Erro ao listar produtos.');
    res.redirect('/');
  }
});

// Página de cadastro de produto
router.get('/products/new', ensureAuthenticated, ensureAdmin , async (req, res) => {
  try {
    const suppliers = await db.Supplier.findAll();
    res.render('products/new', { suppliers, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao carregar fornecedores:', err);
    req.flash('error', 'Erro ao carregar fornecedores.');
    res.redirect('/products');
  }
});

// Cadastro de produto
router.post('/products', ensureAuthenticated, ensureAdmin , async (req, res) => {
  const { name, supplier_id, cost_value, sale_value } = req.body;
  try {
    await db.Product.create({ name, supplier_id: supplier_id || null, cost_value, sale_value });
    req.flash('success', 'Produto cadastrado com sucesso!');
    res.redirect('/products');
  } catch (err) {
    console.error('❌ Erro ao cadastrar produto:', err);
    req.flash('error', 'Erro ao cadastrar produto.');
    res.redirect('/products/new');
  }
});

// Página de edição de produto
router.get('/products/edit/:id', ensureAuthenticated, ensureAdmin , async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id, { include: db.Supplier });
    const suppliers = await db.Supplier.findAll();
    if (!product) {
      req.flash('error', 'Produto não encontrado!');
      return res.redirect('/products');
    }
    res.render('products/edit', { product, suppliers, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao buscar produto:', err);
    req.flash('error', 'Erro ao buscar produto.');
    res.redirect('/products');
  }
});

// Atualização de produto
router.post('/products/edit/:id', ensureAuthenticated, ensureAdmin , async (req, res) => {
  const { name, supplier_id, cost_value, sale_value } = req.body;
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      req.flash('error', 'Produto não encontrado!');
      return res.redirect('/products');
    }
    await product.update({ name, supplier_id: supplier_id || null, cost_value, sale_value });
    req.flash('success', 'Produto atualizado com sucesso!');
    res.redirect('/products');
  } catch (err) {
    console.error('❌ Erro ao atualizar produto:', err);
    req.flash('error', 'Erro ao atualizar produto.');
    res.redirect(`/products/edit/${req.params.id}`);
  }
});

// Exclusão de produto
router.post('/products/delete/:id', ensureAuthenticated, ensureAdmin , async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      req.flash('error', 'Produto não encontrado!');
      return res.redirect('/products');
    }
    await product.destroy();
    req.flash('success', 'Produto excluído com sucesso!');
    res.redirect('/products');
  } catch (err) {
    console.error('❌ Erro ao excluir produto:', err);
    req.flash('error', 'Erro ao excluir produto.');
    res.redirect('/products');
  }
});

module.exports = router;
