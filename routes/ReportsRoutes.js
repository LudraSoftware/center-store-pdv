const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Sales, Invoice, User } = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/sellers', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const selectedMonth = req.query.month || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
        const [year, month] = selectedMonth.split('-');
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const months = await Sales.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month']
            ],
            group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'DESC']],
            raw: true
        });

        const sellersSummaryRaw = await Sales.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
                canceled_at: null
            },
            include: [
                { model: User, as: "seller"},
                {
                    model: Invoice,
                    as: 'invoice',
                }
            ],
            raw: true
        });

        const sellersSummary = Object.values(sellersSummaryRaw.reduce((acc, sale) => {
            const sellerName = sale['seller.name'];
        
            if (!acc[sellerName]) {
                acc[sellerName] = {
                    VENDEDOR: sellerName,
                    TOTAL_VENDIDO: 0,
                    DESCONTO: 0,
                    TOTAL_BRUTO: 0
                };
            }
        
            const totalVendido = sale['invoice.pix_value'] + sale['invoice.credit_value'] + sale['invoice.debit_value'] + sale['invoice.money_value'];
            const desconto = sale['invoice.discount'];
            const totalBruto = (totalVendido - desconto);
        
            acc[sellerName].TOTAL_VENDIDO += totalVendido;
            acc[sellerName].DESCONTO += desconto;
            acc[sellerName].TOTAL_BRUTO += totalBruto;
        
            return acc;
        }, {}));

        res.render('reports/sellers', {
            sellersSummary,
            months,
            selectedMonth,
            currentPage: 'reports',
            messageError: req.flash('error'),
            messageSuccess: req.flash('success')
        });
    } catch (error) {
        console.error('Error loading sellers report:', error);
        req.flash('error', 'Erro ao carregar relatório de vendedores');
        res.redirect('/dashboard');
    }
});

module.exports =  router;