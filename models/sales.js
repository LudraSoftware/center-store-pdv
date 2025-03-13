const { Model, DataTypes } = require("sequelize");
// 📌 Model: sales.js
module.exports = (sequelize) => {
  class Sales extends Model {}

  Sales.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_id: { 
      type: DataTypes.INTEGER, 
      references: { model: 'invoice', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    seller_id: { 
      type: DataTypes.INTEGER, 
      references: { model: 'user', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    customer_id: { 
      type: DataTypes.INTEGER, 
      references: { model: 'customer', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, { 
    sequelize, 
    modelName: 'Sales',
    tableName: 'sales',
    freezeTableName: true,
    timestamps: false
  });

  return Sales;
};