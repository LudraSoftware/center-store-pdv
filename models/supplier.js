const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => { // 🔹 Remove DataTypes do parâmetro
  class Supplier extends Model {}

  Supplier.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'supplier',
    freezeTableName: true,
    timestamps: false
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.Product, { foreignKey: 'supplier_id', as: 'products' });
  };

  return Supplier;
};
