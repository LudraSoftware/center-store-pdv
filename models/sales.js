const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Sales extends Model {}
  Sales.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: DataTypes.INTEGER,
        references: { model: "product", key: "id" },
      },
      seller_id: {
        type: DataTypes.INTEGER,
        references: { model: "user", key: "id" },
      },
      customer_id: {
        type: DataTypes.INTEGER,
        references: { model: "customer", key: "id" },
      },
      discount: { type: DataTypes.FLOAT },
      pix_value: { type: DataTypes.FLOAT },
      credit_value: { type: DataTypes.FLOAT },
      debit_value: { type: DataTypes.FLOAT },
      money_value: { type: DataTypes.FLOAT },
      other_value: { type: DataTypes.FLOAT },
      other_desc: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "sales",
      tableName: "sales",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Sales;
};
