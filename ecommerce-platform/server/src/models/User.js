import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    tableName: 'users',
    hooks: {
      async beforeCreate(user) {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

User.prototype.comparePassword = function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

export default User;