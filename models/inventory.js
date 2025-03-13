const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Inventory extends Model {}

  Inventory.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { 
      type: DataTypes.INTEGER, 
      references: { model: 'product', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    freezeTableName: true,
    timestamps: true
  });

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' }); // 🔹 Associação reversa
  };

  return Inventory;
};
