module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.createTable("supplier", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
    });

    await queryInterface.createTable("product", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      supplier_id: {
        type: Sequelize.INTEGER,
        references: { model: "supplier", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      cost_value: { type: Sequelize.FLOAT, allowNull: false },
      sale_value: { type: Sequelize.FLOAT, allowNull: false },
    });

    await queryInterface.createTable("customer_info", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      document: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone_number: { type: Sequelize.STRING, allowNull: false },
      alt_phone_number: { type: Sequelize.STRING },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.createTable("customer_address", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      postal_code: { type: Sequelize.STRING, allowNull: false },
      street: { type: Sequelize.STRING, allowNull: false },
      number: { type: Sequelize.STRING, allowNull: false },
      neighborhood: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.createTable("customer", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "customer_address", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      info_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "customer_info", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.createTable("sales", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER,
        references: { model: "product", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: { model: "user", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      customer_id: {
        type: Sequelize.INTEGER,
        references: { model: "customer", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      discount: { type: Sequelize.FLOAT, allowNull: true },
      pix_value: { type: Sequelize.FLOAT, allowNull: true },
      credit_value: { type: Sequelize.FLOAT, allowNull: true },
      debit_value: { type: Sequelize.FLOAT, allowNull: true },
      money_value: { type: Sequelize.FLOAT, allowNull: true },
      other_value: { type: Sequelize.FLOAT, allowNull: true },
      other_desc: { type: Sequelize.STRING, allowNull: true },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("sales");
    await queryInterface.dropTable("customer");
    await queryInterface.dropTable("customer_address");
    await queryInterface.dropTable("customer_info");
    await queryInterface.dropTable("product");
    await queryInterface.dropTable("supplier");
    await queryInterface.dropTable("user");
  },
};
