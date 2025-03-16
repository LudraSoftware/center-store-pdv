const express = require('express');
const router = express.Router();
const { Supplier, Product, Inventory } = require('../models');

const { ensureAuthenticated, ensureAdmin  } = require('../middlewares/auth');

// 📌 Listar fornecedores
router.get('/', ensureAuthenticated, ensureAdmin,  async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            attributes: ["id", "name"], // Pegando apenas o ID e o Nome do fornecedor
            include: [
                {
                    model: Product,
                    as: "products",
                    attributes: ["id", "name", "sale_value"] // Pegando apenas os atributos necessários dos produtos
                }
            ]
        });
        // 🔹 Removendo createdAt e updatedAt
        res.render('suppliers/list', { suppliers, messageError: req.flash('error'), messageSuccess: req.flash('success'),  currentPage: 'supplier' });
    } catch (err) {
        console.error('❌ Erro ao listar fornecedores:', err);
        req.flash('error', 'Erro ao listar fornecedores.');
        res.redirect('/dashboard');
    }
});

// 📌 Página de criação de fornecedor
router.get('/create', ensureAuthenticated, ensureAdmin,  (req, res) => {
    res.render('suppliers/create', { messageError: req.flash('error'), messageSuccess: req.flash('success'),  currentPage: 'supplier' });
});

// 📌 Criar um fornecedor
router.post('/create', ensureAuthenticated, ensureAdmin,  async (req, res) => {
    try {
        const { name } = req.body;
        await Supplier.create({ name });
        req.flash('success', 'Fornecedor cadastrado com sucesso!');
        res.redirect('/suppliers');
    } catch (err) {
        console.error('❌ Erro ao criar fornecedor:', err);
        req.flash('error', 'Erro ao cadastrar fornecedor.');
        res.redirect('/suppliers/create');
    }
});

// 📌 Página de edição de fornecedor
router.get('/edit/:id', ensureAuthenticated, ensureAdmin,  async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) {
            req.flash('error', 'Fornecedor não encontrado.');
            return res.redirect('/suppliers');
        }
        res.render('suppliers/edit', { supplier, messageError: req.flash('error'), messageSuccess: req.flash('success'),  currentPage: 'supplier' });
    } catch (err) {
        console.error('❌ Erro ao buscar fornecedor:', err);
        req.flash('error', 'Erro ao buscar fornecedor.');
        res.redirect('/suppliers');
    }
});

// 📌 Atualizar fornecedor
router.post('/edit/:id', ensureAuthenticated, ensureAdmin,  async (req, res) => {
    try {
        const { name } = req.body;
        await Supplier.update({ name }, { where: { id: req.params.id } });
        req.flash('success', 'Fornecedor atualizado com sucesso!');
        res.redirect('/suppliers');
    } catch (err) {
        console.error('❌ Erro ao atualizar fornecedor:', err);
        req.flash('error', 'Erro ao atualizar fornecedor.');
        res.redirect(`/suppliers/edit/${req.params.id}`);
    }
});

// 📌 Deletar fornecedor
router.post('/delete/:id', ensureAuthenticated, ensureAdmin,  async (req, res) => {
    try {
        await Supplier.destroy({ where: { id: req.params.id } });
        req.flash('success', 'Fornecedor deletado com sucesso!');
        res.redirect('/suppliers');
    } catch (err) {
        console.error('❌ Erro ao deletar fornecedor:', err);
        req.flash('error', 'Erro ao deletar fornecedor.');
        res.redirect('/suppliers');
    }
});

// 📌 Visualizar fornecedor e produtos associados
router.get('/view/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id, {
            attributes: ["id", "name"], // Pegando apenas os dados essenciais do fornecedor
            include: [
                {
                    model: Product,
                    as: "products",
                    attributes: ["id", "name", "sale_value"], // Pegando apenas os atributos necessários dos produtos
                    include: [
                        {
                            model: Inventory,
                            as: "inventory",
                            attributes: ["quantity"] // Pegando a quantidade disponível no estoque
                        }
                    ]
                }
            ]
        });

        if (!supplier) {
            req.flash('error', 'Fornecedor não encontrado.');
            return res.redirect('/suppliers');
        }
        res.render('suppliers/view', { supplier, messageError: req.flash('error'), messageSuccess: req.flash('success'),  currentPage: 'supplier' });
    } catch (err) {
        console.error('❌ Erro ao visualizar fornecedor:', err);
        req.flash('error', 'Erro ao visualizar fornecedor.');
        res.redirect('/suppliers');
    }
});

module.exports = router;