const express = require("express");
const router = express.Router();
const { Product, Supplier, Inventory } = require("../models");

const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");

// 📌 Listar produtos
router.get("/",  async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ["id", "name", "cost_value", "sale_value"],
      include: [
        { model: Supplier, as: "supplier", attributes: ["name"] }, // 🔹 Certifique-se que o alias é 'supplier'
        { model: Inventory, as: "inventory", attributes: ["quantity"] }, // 🔹 Usa 'inventory' como definido no model
      ],
    });

    res.render("products/list", {
      products,
      messageError: req.flash("error"),
      messageSuccess: req.flash("success"),
      currentPage: 'products'
    });
  } catch (err) {
    console.error("❌ Erro ao listar produtos:", err);
    req.flash("error", "Erro ao listar produtos.");
    res.redirect("/dashboard");
  }
});

// 📌 Página de criação de produto
router.get("/create",  async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({ attributes: ["id", "name"] });
    res.render("products/create", {
      suppliers,
      messageError: req.flash("error"),
      messageSuccess: req.flash("success"),
       currentPage: 'products'
    });
  } catch (err) {
    console.error("❌ Erro ao carregar fornecedores:", err);
    req.flash("error", "Erro ao carregar fornecedores.");
    res.redirect("/products");
  }
});

// 📌 Criar um produto
router.post("/create",  async (req, res) => {
  try {
    const { name, supplier_id, cost_value, sale_value, quantity } = req.body;
    const product = await Product.create({
      name,
      supplier_id,
      cost_value,
      sale_value,
    });
    await Inventory.create({ product_id: product.id, quantity });
    req.flash("success", "Produto cadastrado com sucesso!");
    res.redirect("/products");
  } catch (err) {
    console.error("❌ Erro ao criar produto:", err);
    req.flash("error", "Erro ao cadastrar produto.");
    res.redirect("/products/create");
  }
});

// 📌 Página de edição de produto
router.get("/edit/:id",  async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Inventory, as: "inventory" }],
    });
    const suppliers = await Supplier.findAll({ attributes: ["id", "name"] });
    if (!product) {
      req.flash("error", "Produto não encontrado.");
      return res.redirect("/products");
    }
    res.render("products/edit", {
      product,
      suppliers,
      messageError: req.flash("error"),
      messageSuccess: req.flash("success"),
      currentPage: 'products'
    });
  } catch (err) {
    console.error("❌ Erro ao buscar produto:", err);
    req.flash("error", "Erro ao buscar produto.");
    res.redirect("/products");
  }
});

// 📌 Atualizar produto
router.post("/edit/:id",  async (req, res) => {
  try {
    const { name, supplier_id, cost_value, sale_value, quantity } = req.body;
    await Product.update(
      { name, supplier_id, cost_value, sale_value },
      { where: { id: req.params.id } }
    );
    await Inventory.update(
      { quantity },
      { where: { product_id: req.params.id } }
    );
    req.flash("success", "Produto atualizado com sucesso!");
    res.redirect("/products");
  } catch (err) {
    console.error("❌ Erro ao atualizar produto:", err);
    req.flash("error", "Erro ao atualizar produto.");
    res.redirect(`/products/edit/${req.params.id}`);
  }
});

// 📌 Deletar produto
router.post(
  "/delete/:id",
  async (req, res) => {
    try {
      await Inventory.destroy({ where: { product_id: req.params.id } }); // 🔹 Remove do estoque antes
      await Product.destroy({ where: { id: req.params.id } });
      return res.status(200).json({ message: "success!" });
    } catch (err) {
      console.error("❌ Erro ao deletar produto:", err);
      req.flash("error", "Erro ao deletar produto.");
      res.redirect("/products");
    }
  }
);

// 📌 Visualizar produto e quantidade em estoque
router.get("/view/:id",  async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: "supplier" },
        { model: Inventory, as: "inventory" },
      ],
    });
    if (!product) {
      req.flash("error", "Produto não encontrado.");
      return res.redirect("/products");
    }
    res.render("products/view", {
      product,
      messageError: req.flash("error"),
      messageSuccess: req.flash("success"),
      currentPage: 'products'
    });
  } catch (err) {
    console.error("❌ Erro ao visualizar produto:", err);
    req.flash("error", "Erro ao visualizar produto.");
    res.redirect("/products");
  }
});

module.exports = router;
