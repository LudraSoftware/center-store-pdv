const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CustomerInfo extends Model {}
  CustomerInfo.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      document: { type: DataTypes.STRING, allowNull: false, unique: true  },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone_number: { type: DataTypes.STRING, allowNull: false },
      alt_phone_number: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "customer_info",
      tableName: "customer_info",
      freezeTableName: true,
      timestamps: true
    }
  );

  return CustomerInfo;
};
