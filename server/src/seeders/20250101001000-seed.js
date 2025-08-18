'use strict';
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const adminId = uuid();
    const customerId = uuid();
    await queryInterface.bulkInsert('Users', [
      { id: adminId, email: 'admin@example.com', passwordHash: await bcrypt.hash('admin123', 10), name: 'Admin', role: 'admin', createdAt: now, updatedAt: now },
      { id: customerId, email: 'user@example.com', passwordHash: await bcrypt.hash('user12345', 10), name: 'User', role: 'customer', createdAt: now, updatedAt: now }
    ]);

    const cat1 = uuid();
    const cat2 = uuid();
    await queryInterface.bulkInsert('Categories', [
      { id: cat1, name: 'Apparel', createdAt: now, updatedAt: now },
      { id: cat2, name: 'Electronics', createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('Products', [
      { id: uuid(), name: 'T-Shirt', description: 'Soft cotton tee', price: 19.99, stock: 100, imageUrl: '', CategoryId: cat1, createdAt: now, updatedAt: now },
      { id: uuid(), name: 'Headphones', description: 'Noise-cancelling', price: 99.99, stock: 50, imageUrl: '', CategoryId: cat2, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};

