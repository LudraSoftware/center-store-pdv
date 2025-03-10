const express = require('express');
const db = require('../models'); // Importa o banco de dados corretamente
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');
const { Sequelize } = require('sequelize');

const router = express.Router();

// Listar todos os clientes
router.get('/customers', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const customers = await db.Customer.findAll({ include: [db.CustomerAddress, db.CustomerInfo] });
    res.render('customers/list', { customers, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao listar clientes:', err);
    req.flash('error', 'Erro ao listar clientes.');
    res.redirect('/dashboard');
  }
});

// Página de cadastro de cliente
router.get('/customers/new', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('customers/new', {
    messageError: req.flash('error'),
    messageSuccess: req.flash('success'),
    formData: req.flash('formData')[0] || {}
  });
});

// Cadastro de cliente com transação
router.post('/customers', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { name, postal_code, street, number, neighborhood, state, document, email, phone_number, alt_phone_number } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    // Verifica se o documento ou email já existem
    const existingCustomer = await db.CustomerInfo.findOne({ where: { [Sequelize.Op.or]: [{ document }, { email }] }, transaction });
    if (existingCustomer) {
      req.flash('error', 'E-mail ou documento já cadastrado!');
      req.flash('formData', req.body);
      await transaction.rollback();
      return res.redirect('/customers/new');
    }

    // Criar endereço
    const customerAddress = await db.CustomerAddress.create({ postal_code, street, number, neighborhood, state }, { transaction });
    
    // Criar informações adicionais
    const customerInfo = await db.CustomerInfo.create({ document, email, phone_number, alt_phone_number }, { transaction });
    
    // Criar cliente
    await db.Customer.create({ name, address_id: customerAddress.id, info_id: customerInfo.id }, { transaction });
    
    // Commit da transação
    await transaction.commit();
    req.flash('success', 'Cliente cadastrado com sucesso!');
    res.redirect('/customers/new');
  } catch (err) {
    console.error('❌ Erro ao cadastrar cliente:', err);
    req.flash('error', 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
    req.flash('formData', req.body);
    await transaction.rollback();
    res.redirect('/customers/new');
  }
});

// Página de edição de cliente
router.get('/customers/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id, { include: [db.CustomerAddress, db.CustomerInfo] });
    if (!customer) {
      req.flash('error', 'Cliente não encontrado!');
      return res.redirect('/customers');
    }
    res.render('customers/edit', { customer, messageError: req.flash('error'), messageSuccess: req.flash('success') });
  } catch (err) {
    console.error('❌ Erro ao buscar cliente:', err);
    req.flash('error', 'Erro ao buscar cliente.');
    res.redirect('/customers');
  }
});

// Atualização de cliente
router.post('/customers/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { name, postal_code, street, number, neighborhood, state, document, email, phone_number, alt_phone_number } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    const customer = await db.Customer.findByPk(req.params.id, { include: [db.CustomerAddress, db.CustomerInfo], transaction });
    if (!customer) {
      req.flash('error', 'Cliente não encontrado!');
      await transaction.rollback();
      return res.redirect('/customers');
    }

    // Verifica se o documento ou email já existem em outro cliente
    const existingCustomer = await db.CustomerInfo.findOne({ where: { [Sequelize.Op.or]: [{ document }, { email }], id: { [Sequelize.Op.ne]: customer.info_id } }, transaction });
    if (existingCustomer) {
      req.flash('error', 'E-mail ou documento já cadastrado!');
      req.flash('formData', req.body);
      await transaction.rollback();
      return res.redirect(`/customers/edit/${req.params.id}`);
    }

    await customer.CustomerAddress.update({ postal_code, street, number, neighborhood, state }, { transaction });
    await customer.CustomerInfo.update({ document, email, phone_number, alt_phone_number }, { transaction });
    await customer.update({ name }, { transaction });
    
    await transaction.commit();
    req.flash('success', 'Cliente atualizado com sucesso!');
    res.redirect('/customers');
  } catch (err) {
    console.error('❌ Erro ao atualizar cliente:', err);
    req.flash('error', 'Erro ao atualizar cliente.');
    req.flash('formData', req.body);
    await transaction.rollback();
    res.redirect(`/customers/edit/${req.params.id}`);
  }
});

// Exclusão de cliente
router.post('/customers/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const customer = await db.Customer.findByPk(req.params.id, { include: [db.CustomerAddress, db.CustomerInfo], transaction });
    if (!customer) {
      req.flash('error', 'Cliente não encontrado!');
      await transaction.rollback();
      return res.redirect('/customers');
    }

    await customer.CustomerAddress.destroy({ transaction });
    await customer.CustomerInfo.destroy({ transaction });
    await customer.destroy({ transaction });
    
    await transaction.commit();
    req.flash('success', 'Cliente excluído com sucesso!');
    res.redirect('/customers');
  } catch (err) {
    console.error('❌ Erro ao excluir cliente:', err);
    req.flash('error', 'Erro ao excluir cliente.');
    await transaction.rollback();
    res.redirect('/customers');
  }
});

module.exports = router;