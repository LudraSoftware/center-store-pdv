const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Supplier extends Model {}
  Supplier.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "supplier",
      tableName: "supplier",
      freezeTableName: true,
      timestamps: true
    }
  );

  return Supplier;
};
