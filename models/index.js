const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false
});

// Importar models corretamente
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize);
db.Supplier = require('./supplier')(sequelize);
db.Product = require('./product')(sequelize);
db.Inventory = require('./inventory')(sequelize);
db.CustomerInfo = require('./customer_info')(sequelize);
db.CustomerAddress = require('./customer_address')(sequelize);
db.Customer = require('./customer')(sequelize);
db.Invoice = require('./invoice')(sequelize);
db.Sales = require('./sales')(sequelize);

// Criar as associações
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
