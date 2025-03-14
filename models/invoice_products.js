const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InvoiceProducts extends Model {}

  InvoiceProducts.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // ✅ Definindo como chave primária composta
        references: { model: "product", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // ✅ Definindo como chave primária composta
        references: { model: "invoice", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      sequelize,
      modelName: "InvoiceProducts",
      tableName: "invoice_products",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return InvoiceProducts;
};
