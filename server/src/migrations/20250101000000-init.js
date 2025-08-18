'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.UUID, primaryKey: true },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Categories', {
      id: { type: Sequelize.UUID, primaryKey: true },
      name: { type: Sequelize.STRING, unique: true, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Products', {
      id: { type: Sequelize.UUID, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      imageUrl: { type: Sequelize.STRING },
      CategoryId: { type: Sequelize.UUID, references: { model: 'Categories', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Orders', {
      id: { type: Sequelize.UUID, primaryKey: true },
      status: { type: Sequelize.STRING, allowNull: false },
      totalAmount: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      customerId: { type: Sequelize.UUID, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('OrderItems', {
      id: { type: Sequelize.UUID, primaryKey: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unitPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      OrderId: { type: Sequelize.UUID, references: { model: 'Orders', key: 'id' }, onDelete: 'CASCADE' },
      ProductId: { type: Sequelize.UUID, references: { model: 'Products', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Payments', {
      id: { type: Sequelize.UUID, primaryKey: true },
      provider: { type: Sequelize.STRING, allowNull: false },
      providerPaymentId: { type: Sequelize.STRING },
      amount: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      currency: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false },
      OrderId: { type: Sequelize.UUID, references: { model: 'Orders', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Payments');
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');
  }
};

