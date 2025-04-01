const express = require('express');
const router = express.Router();
const db = require('../models');
const { Invoice, Sales, InvoiceProducts, Product, Inventory, User, Customer } = require('../models');


const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");

// 📌 Listagem de Vendas
router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const sales = await Sales.findAll({
            include: [
                { model: User, as: "seller", attributes: ["id", "name"] },
                { model: Customer, as: "customer", attributes: ["id", "name"] },
                { 
                    model: Invoice, 
                    as: "invoice",
                    attributes: ["id", "discount", "money_value", "pix_value", "credit_value", "debit_value", "other_value", "createdAt"]
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.render("sales/list", { sales, currentPage: 'sales' });
    } catch (error) {
        console.error("❌ Erro ao listar vendas:", error);
        res.status(500).send("Erro ao carregar vendas.");
    }
});

// 📌 Visualizar detalhes da venda
router.get("/view/:id", ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const sale = await Sales.findByPk(req.params.id, {
            include: [
                { model: User, as: "seller", attributes: ["id", "name"] },
                { model: Customer, as: "customer", attributes: ["id", "name"] },
                { 
                    model: Invoice,
                    as: "invoice",
                    attributes: ["id", "discount", "money_value", "pix_value", "credit_value", "debit_value", "other_value", "other_desc", "invoice_description",  "createdAt"],
                    include: [
                        {
                            model: InvoiceProducts, // ✅ Associação corrigida
                            as: "invoiceProducts", // ✅ Usando o alias correto
                            include: [
                                { model: Product, as: "product", attributes: ["id", "name", "cost_value", "sale_value"] }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!sale) {
            return res.status(404).send("Venda não encontrada.");
        }

        res.render("sales/view", { sale, currentPage: 'sales' });
    } catch (error) {
        console.error("❌ Erro ao visualizar venda:", error);
        res.status(500).send("Erro ao carregar detalhes da venda.");
    }
});

// 🔹 Página do checkout
router.get('/checkout', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: { model: Inventory, as: 'inventory' }
        });

        const customers = await Customer.findAll();
        const sellers = await User.findAll({ where: { type: 'seller' } });

        res.render('sales/checkout', {
            products,
            customers,
            sellers,
            checkoutItems: [],
            total: 0,
            payments: [],
            discount: 0,
            currentPage: 'checkout'
        });
    } catch (err) {
        console.error('❌ Erro ao carregar checkout:', err);
        req.flash('error', 'Erro ao carregar checkout.');
        res.redirect('/dashboard');
    }
});


router.post('/checkout', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const { seller_id, customer_id, products, payments, discount, other_desc, invoice_description } = req.body;

    try {
        // 🔹 1️⃣ Verificar se o vendedor existe
        const seller = await db.User.findByPk(seller_id);
        if (!seller) return res.status(400).json({ message: "Vendedor não encontrado!" });

        console.log("✅ Vendedor válido:", seller.name);

        // 🔹 2️⃣ Verificar se o cliente existe
        const customer = await db.Customer.findByPk(customer_id);
        if (!customer) return res.status(400).json({ message: "Cliente não encontrado!" });

        console.log("✅ Cliente válido:", customer.name);

        // 🔹 3️⃣ Verificar produtos e estoque
        let invalidProducts = [];
        let insufficientStock = [];
        let totalPrice = 0;

        for (const item of products) {
            const product = await db.Product.findByPk(item.id, {
                include: [{ model: db.Inventory, as: 'inventory' }]
            });

            if (!product) {
                invalidProducts.push(item.id);
            } else if (product.inventory.quantity < item.quantity) {
                insufficientStock.push({
                    product: product.name,
                    available: product.inventory.quantity,
                    requested: item.quantity
                });
            } else {
                totalPrice += product.sale_value * item.quantity;
            }
        }

        if (invalidProducts.length > 0) {
            return res.status(400).json({ message: "Produtos inválidos!", invalidProducts });
        }

        if (insufficientStock.length > 0) {
            return res.status(400).json({ message: "Estoque insuficiente!", insufficientStock });
        }

        console.log("✅ Produtos válidos!");

         // 🔹 4️⃣ Testar pagamentos e valores
         let totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
         let finalTotal = totalPrice - (discount || 0);
 
         if (totalPayments !== finalTotal) {
             return res.status(400).json({ message: "Os valores dos pagamentos não correspondem ao total!" });
         }

        console.log(`✅ Total da compra: R$ ${finalTotal.toFixed(2)}`);
        console.log(`✅ Total dos pagamentos: R$ ${totalPayments.toFixed(2)}`);

        // 🔹 5️⃣ Criar transação no banco
        const transaction = await db.sequelize.transaction();

        try {
            // Criar invoice (nota fiscal)
            const invoice = await db.Invoice.create({
                discount,
                pix_value: payments.find(p => p.type === "pix")?.value || 0,
                credit_value: payments.find(p => p.type === "credit")?.value || 0,
                debit_value: payments.find(p => p.type === "debit")?.value || 0,
                money_value: payments.find(p => p.type === "money")?.value || 0,
                other_value: payments.find(p => p.type === "other")?.value || 0,
                other_desc: other_desc ?? "",
                invoice_description: invoice_description
            }, { transaction });

            console.log("✅ Invoice criada:", invoice.id);

            // Criar venda (Sales)
            const sale = await db.Sales.create({
                invoice_id: invoice.id,
                seller_id,
                customer_id
            }, { transaction });

            console.log("✅ Venda registrada na tabela Sales:", sale.id);

            // Criar registros em invoice_products
            for (const item of products) {
                await db.InvoiceProducts.create({
                    product_id: item.id,
                    invoice_id: invoice.id,
                    quantity: item.quantity
                }, { transaction });

                // Reduzir quantidade no estoque
                await db.Inventory.decrement('quantity', {
                    by: item.quantity,
                    where: { product_id: item.id },
                    transaction
                });
            }

            console.log("✅ Produtos adicionados à nota fiscal e estoque atualizado!");

            // Finalizar transação
            await transaction.commit();
            res.json({ message: "Venda realizada com sucesso!", invoice_id: invoice.id });

        } catch (err) {
            console.error("❌ Erro na transação:", err);
            await transaction.rollback();
            res.status(500).json({ message: "Erro ao processar a venda!" });
        }

    } catch (error) {
        console.error("❌ Erro ao processar a venda:", error);
        res.status(500).json({ message: "Erro ao processar a venda!" });
    }
});

module.exports = router;
