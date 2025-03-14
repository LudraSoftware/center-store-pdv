const express = require("express");
const router = express.Router();
const { Sales, Invoice, InvoiceProducts, Product, Customer, CustomerInfo, User } = require("../models");

// 🔹 Listar todas as notas fiscais corretamente via `Sales`
router.get("/", async (req, res) => {
    try {
        const invoices = await Sales.findAll({
            include: [
                {
                    model: Invoice,
                    as: "invoice",
                    include: [
                        {
                            model: InvoiceProducts,
                            as: "invoiceProducts",
                            include: [
                                {
                                    model: Product,
                                    as: "product",
                                    attributes: ["name", "sale_value"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Customer,
                    as: "customer",
                    include: [{ model: CustomerInfo, as: "customerInfo" }]
                },
                {
                    model: User,
                    as: "seller",
                    attributes: ["name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.render("invoices/list", { invoices });
    } catch (error) {
        console.error("❌ Erro ao listar notas fiscais:", error);
        res.status(500).send("Erro ao listar notas fiscais.");
    }
});

// 🔹 Visualizar detalhes de uma nota fiscal
router.get("/view/:id", async (req, res) => {
    try {
        const invoice = await Sales.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Invoice,
                    as: "invoice",
                    include: [
                        {
                            model: InvoiceProducts,
                            as: "invoiceProducts",
                            include: [
                                {
                                    model: Product,
                                    as: "product",
                                    attributes: ["name", "sale_value"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Customer,
                    as: "customer",
                    include: [{ model: CustomerInfo, as: "customerInfo" }]
                },
                {
                    model: User,
                    as: "seller",
                    attributes: ["name"]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).send("Nota fiscal não encontrada.");
        }

        res.render("invoices/view", { invoice });
    } catch (error) {
        console.error("❌ Erro ao visualizar nota fiscal:", error);
        res.status(500).send("Erro ao visualizar nota fiscal.");
    }
});

module.exports = router;
