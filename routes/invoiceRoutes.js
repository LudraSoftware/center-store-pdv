const express = require("express");
const router = express.Router();
const { Sales, Invoice, InvoiceProducts, Product, Customer, CustomerInfo, CustomerAddress, User } = require("../models");

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

        res.render("invoices/list", { invoices, currentPage: 'invoices' });
    } catch (error) {
        console.error("❌ Erro ao listar notas fiscais:", error);
        res.status(500).send("Erro ao listar notas fiscais.");
    }
});


router.get('/complete/:id', async (req, res) => {
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
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Customer,
                    as: "customer",
                    include: [
                        { 
                            model: CustomerInfo, 
                            as: "customerInfo", 
                            attributes: ["document", "email", "phone_number"] 
                        },
                        {
                            model: CustomerAddress,
                            as: "customerAddress",
                        }
                    ]
                },
                {
                    model: User,
                    as: "seller",
                    attributes: ["name"]
                }
            ]
        });

        if (!invoice) {
            req.flash("error", "Nota fiscal não encontrada.");
            return res.redirect("/");
        }

        // Passando os dados da empresa do .env
        const company = {
            name: process.env.EMPLOYMENT_NAME,
            document: process.env.EMPLOYMENT_CNPJ,
            email: process.env.EMPLOYMENT_EMAIL,
            phone: process.env.EMPLOYMENT_PHONE,
            address: {
                street: process.env.EMPLOYMENT_ADDRESS_STREET,
                number: process.env.EMPLOYMENT_ADDRESS_NUMBER,
                neighborhood: process.env.EMPLOYMENT_ADDRESS_NEIGHBORHOOD,
                city: process.env.EMPLOYMENT_ADDRESS_CITY,
                state: process.env.EMPLOYMENT_ADDRESS_STATE,
                postal_code: process.env.EMPLOYMENT_ADDRESS_ZIPCODE,
            },
            logo_v: process.env.EMPLOYMENT_LOGO_V,
            logo_h: process.env.EMPLOYMENT_LOGO_H,
        };

        res.render("invoices/complete", { invoice, company, layout: false });
    } catch (error) {
        console.error("Erro ao carregar a DANFE:", error);
        res.status(500).send("Erro ao carregar DANFE.");
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
                                    attributes: ["id", "name", "sale_value"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Customer,
                    as: "customer",
                    include: [
                        { 
                            model: CustomerInfo, 
                            as: "customerInfo", 
                        },
                        {
                            model: CustomerAddress,
                            as: "customerAddress",
                        }
                    ]
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

        res.render("invoices/view", { invoice, currentPage: 'invoices'  });
    } catch (error) {
        console.error("❌ Erro ao visualizar nota fiscal:", error);
        res.status(500).send("Erro ao visualizar nota fiscal.");
    }
});

router.get('/complete/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Sales,
                    as: "sales",
                    include: [
                        {
                            model: User,
                            as: "seller",
                            attributes: ["name"]
                        },
                        {
                            model: Customer,
                            as: "customer",
                            include: [
                                {
                                    model: CustomerInfo,
                                    as: "customerInfo",
                                    attributes: ["document", "email", "phone_number"]
                                },
                                {
                                    model: CustomerAddress,
                                    as: "customerAddress",
                                    attributes: ["street", "number", "neighborhood", "city", "state", "postal_code"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: InvoiceProducts,
                    as: "invoiceProducts",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "sale_value"]
                        }
                    ]
                }
            ]
        });

        if (!invoice) {
            req.flash("error", "Nota fiscal não encontrada.");
            return res.redirect("/");
        }

        res.render("invoice_complete", { invoice });
    } catch (error) {
        console.error("Erro ao carregar a DANFE:", error);
        res.status(500).send("Erro ao carregar DANFE.");
    }
});

module.exports = router;
