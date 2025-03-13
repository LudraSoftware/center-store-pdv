const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Customer extends Model {}

  Customer.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { model: 'customer_address', key: 'id' }, 
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE'
    },
    info_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { model: 'customer_info', key: 'id' }, 
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE'
    }
  }, { 
    sequelize, 
    modelName: 'Customer', 
    tableName: 'customer',
    freezeTableName: true,
    timestamps: true
  });

  return Customer;
};
