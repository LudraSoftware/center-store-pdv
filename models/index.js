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
const Sales = require('./sales')(sequelize);

// Criar as associações entre os models
User.hasMany(Sales, { foreignKey: 'seller_id' });
Supplier.hasMany(Product, { foreignKey: 'supplier_id' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id' });
Product.hasMany(Sales, { foreignKey: 'product_id' });

Customer.hasOne(CustomerInfo, { foreignKey: 'id' });
Customer.hasOne(CustomerAddress, { foreignKey: 'id' });
Customer.hasMany(Sales, { foreignKey: 'customer_id' });

Sales.belongsTo(User, { foreignKey: 'seller_id' });
Sales.belongsTo(Product, { foreignKey: 'product_id' });
Sales.belongsTo(Customer, { foreignKey: 'customer_id' });

const db = { sequelize, Sequelize, User, Supplier, Product, CustomerInfo, CustomerAddress, Customer, Sales };

module.exports = db;
