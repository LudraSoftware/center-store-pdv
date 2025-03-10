const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Customer extends Model {}
  Customer.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      address_id: {
        type: DataTypes.INTEGER,
        references: { model: "customer_address", key: "id" },
      },
      info_id: {
        type: DataTypes.INTEGER,
        references: { model: "customer_info", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "customer",
      tableName: "customer",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Customer;
};
