const { Sequelize } = require("sequelize");
const config = require("../config/config.js").development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false,
});

// Importar models corretamente
const User = require("./user")(sequelize);
const Supplier = require("./supplier")(sequelize);
const Product = require("./product")(sequelize);
const CustomerInfo = require("./customer_info")(sequelize);
const CustomerAddress = require("./customer_address")(sequelize);
const Customer = require("./customer")(sequelize);
const Invoice = require("./invoice")(sequelize);
const InvoiceProducts = require("./invoice_products")(sequelize);
const Sales = require("./sales")(sequelize);
const Inventory = require("./inventory")(sequelize);

// 🔹 Associações entre os Models

// 🟢 Usuário (Vendedor)
User.hasMany(Sales, { foreignKey: "seller_id", as: "sales" });
Sales.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

// 🟢 Cliente
Customer.hasMany(Sales, { foreignKey: "customer_id", as: "sales" });
Sales.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// 🟢 Associações com Informações do Cliente
Customer.belongsTo(CustomerInfo, { foreignKey: "info_id", as: "customerInfo" });
Customer.belongsTo(CustomerAddress, { foreignKey: "address_id", as: "customerAddress" });

// 🟢 Fornecedores e Produtos
Supplier.hasMany(Product, { foreignKey: "supplier_id", as: "products" });
Product.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });

// 🟢 Estoque
Product.hasOne(Inventory, { foreignKey: "product_id", as: "inventory" });
Inventory.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// 🟢 Nota Fiscal (Invoice) e Produtos Relacionados (InvoiceProducts)
Invoice.hasMany(InvoiceProducts, { foreignKey: "invoice_id", as: "invoiceProducts", onDelete: "CASCADE" });
InvoiceProducts.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });

InvoiceProducts.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(InvoiceProducts, { foreignKey: "product_id", as: "invoiceProducts" });

// 🟢 Vendas (Sales) vinculadas à Nota Fiscal
Sales.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });
Invoice.hasMany(Sales, { foreignKey: "invoice_id", as: "sales" });


// Exportando os models e a conexão Sequelize
const db = {
  sequelize,
  Sequelize,
  User,
  Supplier,
  Product,
  CustomerInfo,
  CustomerAddress,
  Customer,
  Invoice,
  InvoiceProducts,
  Sales,
  Inventory,
};

module.exports = db;
