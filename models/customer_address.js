const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CustomerAddress extends Model {}
  CustomerAddress.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      postal_code: { type: DataTypes.STRING, allowNull: false },
      street: { type: DataTypes.STRING, allowNull: false },
      number: { type: DataTypes.STRING, allowNull: false },
      neighborhood: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "customer_address",
      tableName: "customer_address",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return CustomerAddress;
};
