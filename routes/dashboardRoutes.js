const express = require("express");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");

// Página de dashboard (somente autenticado)
router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
      const todaySales = await dashboardController.getTodaySales();
      const totalCustomers = await dashboardController.getTotalCustomers();
      const totalProducts = await dashboardController.getTotalProducts();
      const dailyProfit = await dashboardController.getDailyProfit();
      const monthlyProfit = await dashboardController.getMonthlyProfit();
      const salesData = await dashboardController.getSalesData();
      const sellersData = await dashboardController.getTopSellers();
      const productsData = await dashboardController.getTopProducts();
      const customersData = await dashboardController.getTopCustomers();
  
      console.log("Customers Data:", customersData); // 🚀 LOG PARA DEBUG
  
      res.render("dashboard", {
        user: req.user,
        messageError: req.flash("error"),
        messageSuccess: req.flash("success"),
        currentPage: "dashboard",
        todaySales: parseFloat(todaySales),
        totalCustomers,
        totalProducts,
        dailyProfit: parseFloat(dailyProfit),
        monthlyProfit: parseFloat(monthlyProfit),
        salesData,
        sellersData,
        productsData,
        customersData
      });
  
    } catch (error) {
      console.error("Erro ao carregar o dashboard:", error);
      res.status(500).send("Erro ao carregar dashboard.");
    }
  });

  module.exports = router;