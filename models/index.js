const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false
});

// Importar models corretamente
const User = require('./user')(sequelize);
const Supplier = require('./supplier')(sequelize);
const Product = require('./product')(sequelize);
const CustomerInfo = require('./customer_info')(sequelize);
const CustomerAddress = require('./customer_address')(sequelize);
const Customer = require('./customer')(sequelize);
const Invoice = require('./invoice')(sequelize);
const InvoiceProducts = require('./invoice_products')(sequelize);
const Sales = require('./sales')(sequelize);
const Inventory = require('./inventory')(sequelize);

// 🔹 Criar as associações corretamente
User.hasMany(Invoice, { foreignKey: 'seller_id' });
Customer.hasMany(Invoice, { foreignKey: 'customer_id' });

Invoice.belongsTo(User, { foreignKey: 'seller_id' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id' });
Invoice.hasMany(InvoiceProducts, { foreignKey: 'invoice_id', onDelete: 'CASCADE' });

Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });

Sales.belongsTo(Product, { foreignKey: 'product_id' });
Sales.belongsTo(Invoice, { foreignKey: 'invoice_id' });

Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasOne(Inventory, { foreignKey: 'product_id', as: 'inventory' });

// 🔹 Correção: Definindo associação entre Customer e CustomerInfo
Customer.belongsTo(CustomerInfo, { foreignKey: 'info_id', as: 'customerInfo' });
Customer.belongsTo(CustomerAddress, { foreignKey: 'address_id', as: 'customerAddress' });

const db = { 
    sequelize, Sequelize, User, Supplier, Product, CustomerInfo, CustomerAddress, 
    Customer, Invoice, InvoiceProducts, Sales, Inventory 
};

module.exports = db;
