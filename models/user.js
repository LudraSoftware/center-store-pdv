const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }
  }, { 
    sequelize, 
    modelName: 'User', 
    tableName: 'user',
    freezeTableName: true,
    timestamps: true
  });

  return User;
};
