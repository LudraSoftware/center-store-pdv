const { Model, DataTypes } = require("sequelize");
// 📌 Model: invoice.js
module.exports = (sequelize) => {
  class Invoice extends Model {}

  Invoice.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    discount: { type: DataTypes.FLOAT, allowNull: true },
    pix_value: { type: DataTypes.FLOAT, allowNull: true },
    credit_value: { type: DataTypes.FLOAT, allowNull: true },
    debit_value: { type: DataTypes.FLOAT, allowNull: true },
    money_value: { type: DataTypes.FLOAT, allowNull: true },
    other_value: { type: DataTypes.FLOAT, allowNull: true },
    other_desc: { type: DataTypes.STRING, allowNull: true }
  }, { 
    sequelize, 
    modelName: 'Invoice',
    tableName: 'invoice',
    freezeTableName: true,
    timestamps: false
  });

  return Invoice;
};
