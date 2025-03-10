const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {}
  Product.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      supplier_id: {
        type: DataTypes.INTEGER,
        references: { model: "supplier", key: "id" },
      },
      cost_value: { type: DataTypes.FLOAT, allowNull: false },
      sale_value: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: "product",
      tableName: "product",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Product;
};
