const { Invoice, InvoiceProducts, Product, Customer, Sales, User } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

// 🔹 1️⃣ **Vendas de Hoje**
exports.getTodaySales = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySalesResult = await Sales.findAll({
    where: { 
      createdAt: { [Op.gte]: today },
      canceled_at: null
    },
    include: [
      {
        model: Invoice,
        as: "invoice",
        attributes: [
          "pix_value",
          "credit_value",
          "debit_value",
          "money_value",
          "other_value",
          "discount"
        ]
      }
    ],
    raw: true
  });

  return todaySalesResult.map(sale => {
    return parseFloat(sale["invoice.pix_value"] || 0) +
      parseFloat(sale["invoice.credit_value"] || 0) +
      parseFloat(sale["invoice.debit_value"] || 0) +
      parseFloat(sale["invoice.money_value"] || 0) +
      parseFloat(sale["invoice.other_value"] || 0) +
      parseFloat(sale["invoice.discount"] || 0);
  }
  ).reduce((acc, curr) => acc + curr, 0).toFixed(2);
};

// 🔹 2️⃣ **Total de Clientes**
exports.getTotalCustomers = async () => {
  return await Customer.count();
};

// 🔹 3️⃣ **Total de Produtos**
exports.getTotalProducts = async () => {
  return await Product.count();
};

// 🔹 4️⃣ **Lucro do Dia**
exports.getDailyProfit = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyProfitResult = await Sales.findAll({
    where: { 
      createdAt: { [Op.gte]: today },
      canceled_at: null
    },
    raw: true
  });

  const invoiceProducts = await InvoiceProducts.findAll({
    attributes: ["invoice_id", "product_id", "quantity"],
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["cost_value", "sale_value"]
      }
    ],
    where: {
      invoice_id: dailyProfitResult.map(sale => sale.invoice_id)
    },
    raw: true
  });

  
  let totalProfit = 0;
  
  invoiceProducts.map(invoiceProduct => {
    totalProfit += parseFloat(invoiceProduct["product.sale_value"] || 0) - parseFloat(invoiceProduct["product.cost_value"] || 0);
  });

  return totalProfit;
};

// 🔹 5️⃣ **Lucro do Mês**
exports.getMonthlyProfit = async () => {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const monthlyProfitResult = await InvoiceProducts.findAll({
    attributes: [
      [fn("SUM", literal("`product`.`sale_value` * `InvoiceProducts`.`quantity`")), "total_sale_value"],
      [fn("SUM", literal("`product`.`cost_value` * `InvoiceProducts`.`quantity`")), "total_cost_value"]
    ],
    include: [
      {
        model: Product,
        as: "product",
        attributes: []
      },
      {
        model: Invoice,
        as: "invoice",
        attributes: [],
        where: { createdAt: { [Op.gte]: firstDayOfMonth } }
      }
    ],
    raw: true
  });

  const totalSaleValue = parseFloat(monthlyProfitResult[0]?.total_sale_value || 0);
  const totalCostValue = parseFloat(monthlyProfitResult[0]?.total_cost_value || 0);
  
  return (totalSaleValue - totalCostValue).toFixed(2);
};

// 🔹 6️⃣ **Vendas dos Últimos 7 Dias**
exports.getSalesData = async () => {
    const last7DaysStart = new Date();
    last7DaysStart.setDate(last7DaysStart.getDate() - 6);
    last7DaysStart.setHours(0, 0, 0, 0);
  
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }).reverse();

    const salesByDay = await Sales.findAll({
      where: { createdAt: { [Op.gte]: last7DaysStart }, canceled_at: null },
      raw: true
    });
  
    const paymentsByDay = await Invoice.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("SUM", col("pix_value")), "pix_value"],
        [fn("SUM", col("credit_value")), "credit_value"],
        [fn("SUM", col("debit_value")), "debit_value"],
        [fn("SUM", col("money_value")), "money_value"],
        [fn("SUM", col("other_value")), "other_value"],
        [fn("SUM", col("discount")), "discount"]
      ],
      where: { createdAt: { [Op.gte]: last7DaysStart },
        id: salesByDay.map(sale => sale.invoice_id)
       },
      group: [fn("DATE", col("createdAt"))],
      raw: true
    });
  
    return {
      labels: last7Days,
      values: last7Days.map(date => {
        const found = paymentsByDay.find(p => 
          new Date(p.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) === date
        );
  
        return found
          ? parseFloat(found.pix_value || 0) + parseFloat(found.credit_value || 0) +
            parseFloat(found.debit_value || 0) + parseFloat(found.money_value || 0) +
            parseFloat(found.other_value || 0) + parseFloat(found.discount || 0)
          : 0;
      })
    };
  };

  // 🔹 **Top Vendedores do Mês**
exports.getTopSellers = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const sellers = await Sales.findAll({
        attributes: [
            "seller_id",
            [fn("SUM", 
                literal(
                    "invoice.pix_value + invoice.credit_value + invoice.debit_value + invoice.money_value + invoice.other_value"
                )
            ), "total_sales"]
        ],
        where: { createdAt: { [Op.gte]: firstDayOfMonth },  canceled_at: null },
        include: [
            {
                model: User,
                as: "seller",
                attributes: ["name"]
            },
            {
                model: Invoice,
                as: "invoice",
                attributes: []
            }
        ],
        group: ["seller_id", "seller.id"],
        order: [[literal("total_sales"), "DESC"]],
        raw: true
    });

    return {
        labels: sellers.map(s => s["seller.name"]),
        values: sellers.map(s => parseFloat(s.total_sales || 0))
    };
};

// 🔹 **Produtos Mais Vendidos do Mês**
exports.getTopProducts = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

  const SalesResult = await Sales.findAll({
        where: { createdAt: { [Op.gte]: firstDayOfMonth}, canceled_at: null },
        raw: true
    });
    
    const invoices = await Invoice.findAll({
        attributes: ["id"],
        where: {
            id: SalesResult.map(sale => sale.invoice_id)
        },
        raw: true
    });

      const products = await InvoiceProducts.findAll({
        attributes: [
            "product_id",
            [fn("SUM", col("quantity")), "total_quantity"]
        ],
        where: { createdAt: { [Op.gte]: firstDayOfMonth }, invoice_id: invoices.map(invoice => invoice.id) },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["name"]
            }
        ],
        group: ["product_id", "product.id"],
        order: [[literal("total_quantity"), "DESC"]],
        raw: true
    });

    return {
        labels: products.map(p => p["product.name"]),
        values: products.map(p => parseInt(p.total_quantity || 0))
    };
};

exports.getTopCustomers = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const customers = await Sales.findAll({
        attributes: [
            "customer_id",
            [fn("SUM", 
                literal(
                    "invoice.pix_value + invoice.credit_value + invoice.debit_value + invoice.money_value + invoice.other_value"
                )
            ), "total_purchases"]
        ],
        where: { createdAt: { [Op.gte]: firstDayOfMonth },  canceled_at: null },
        include: [
            {
                model: Customer,
                as: "customer",
                attributes: ["name"]
            },
            {
                model: Invoice,
                as: "invoice",
                attributes: []
            }
        ],
        group: ["customer_id", "customer.id"],
        order: [[literal("total_purchases"), "DESC"]],
        raw: true
    });
    
    return {
        labels: customers.map(c => c["customer.name"]),
        values: customers.map(c => parseFloat(c.total_purchases || 0))
    };
};
