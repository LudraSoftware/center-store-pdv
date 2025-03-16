const express = require('express');
const router = express.Router();
const { Customer, CustomerInfo, CustomerAddress, Sales, Invoice } = require('../models');

const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");

// 📌 Listar clientes
router.get('/',  async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: ['id', 'name', 'createdAt', 'updatedAt'], // 🔹 Incluindo timestamps
            include: [
                { model: CustomerInfo, as: 'customerInfo', attributes: ['document', 'email', 'phone_number', 'alt_phone_number'] }, // 🔹 Ajustado alias
                { model: CustomerAddress, as: 'customerAddress', attributes: ['postal_code', 'street', 'number', 'neighborhood', 'state'] } // 🔹 Ajustado alias
            ]
        });

        res.render('customers/list', { customers, messageError: req.flash('error'), messageSuccess: req.flash('success'),   currentPage: 'customer' });
    } catch (err) {
        console.error('❌ Erro ao listar clientes:', err);
        req.flash('error', 'Erro ao listar clientes.');
        res.redirect('/dashboard');
    }
});

// 📌 Página de criação de cliente
router.get('/create',  (req, res) => {
    res.render('customers/create', { messageError: req.flash('error'), messageSuccess: req.flash('success'), currentPage: 'customer' });
});

// 📌 Criar um cliente
router.post('/create',  async (req, res) => {
    try {
        const { name, document, email, phone_number, alt_phone_number, postal_code, street, number, neighborhood, state } = req.body;
        
        const customerInfo = await CustomerInfo.create({ document, email, phone_number, alt_phone_number });
        const customerAddress = await CustomerAddress.create({ postal_code, street, number, neighborhood, state });
        await Customer.create({ name, address_id: customerAddress.id, info_id: customerInfo.id });
        
        req.flash('success', 'Cliente cadastrado com sucesso!');
        res.redirect('/customers');
    } catch (err) {
        console.error('❌ Erro ao criar cliente:', err);
        req.flash('error', 'Erro ao cadastrar cliente.');
        res.redirect('/customers/create');
    }
});

// 📌 Página de edição de cliente
router.get('/edit/:id',  async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [
                { model: CustomerInfo, as: 'customerInfo' },
                { model: CustomerAddress, as: 'customerAddress' }
            ]
        });

        if (!customer) {
            req.flash('error', 'Cliente não encontrado.');
            return res.redirect('/customers');
        }

        res.render('customers/edit', { customer, messageError: req.flash('error'), messageSuccess: req.flash('success'),currentPage: 'customer' });
    } catch (err) {
        console.error('❌ Erro ao buscar cliente:', err);
        req.flash('error', 'Erro ao buscar cliente.');
        res.redirect('/customers');
    }
});

// 📌 Atualizar cliente
router.post('/edit/:id',  async (req, res) => {
    const { name, document, email, phone_number, alt_phone_number, postal_code, street, number, neighborhood, state } = req.body;

    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [
                { model: CustomerInfo, as: 'customerInfo' },
                { model: CustomerAddress, as: 'customerAddress' }
            ]
        });

        if (!customer) {
            req.flash('error', 'Cliente não encontrado.');
            return res.redirect('/customers');
        }

        await customer.update({ name });

        if (customer.customerInfo) {
            await customer.customerInfo.update({ document, email, phone_number, alt_phone_number });
        }

        if (customer.customerAddress) {
            await customer.customerAddress.update({ postal_code, street, number, neighborhood, state });
        }

        req.flash('success', 'Cliente atualizado com sucesso!');
        res.redirect('/customers');
    } catch (err) {
        console.error('❌ Erro ao atualizar cliente:', err);
        req.flash('error', 'Erro ao atualizar cliente.');
        res.redirect(`/customers/edit/${req.params.id}`);
    }
});

// 📌 Visualizar cliente e detalhes
router.get('/view/:id',  async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [
                { model: CustomerInfo, as: 'customerInfo' }, // 🔹 Corrigido alias
                { model: CustomerAddress, as: 'customerAddress' } // 🔹 Corrigido alias
            ]
        });

        const sales = await Sales.findAll({
            where: { customer_id: req.params.id },
            include: [
                { model: Invoice, as: 'invoice' }
            ]
        });

        if (!customer) {
            req.flash('error', 'Cliente não encontrado.');
            return res.redirect('/customers');
        }

        res.render('customers/view', { customer, sales, messageError: req.flash('error'), messageSuccess: req.flash('success'),currentPage: 'customer' });
    } catch (err) {
        console.error('❌ Erro ao visualizar cliente:', err);
        req.flash('error', 'Erro ao visualizar cliente.');
        res.redirect('/customers');
    }
});

module.exports = router;