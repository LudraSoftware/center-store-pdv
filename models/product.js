const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {}

  Product.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    supplier_id: { 
      type: DataTypes.INTEGER, 
      references: { model: 'supplier', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    cost_value: { type: DataTypes.FLOAT, allowNull: false },
    sale_value: { type: DataTypes.FLOAT, allowNull: false }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'product',
    freezeTableName: true,
    timestamps: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
    Product.hasOne(models.Inventory, { foreignKey: 'product_id', as: 'inventory' }); // 🔹 Definir relação com Inventory
  };

  return Product;
};
