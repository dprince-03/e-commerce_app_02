import { Product, Category } from '../models/index.js';

export async function listProducts({ limit = 20, offset = 0, categoryId } = {}) {
  const where = {};
  if (categoryId) where.CategoryId = categoryId;
  const { rows, count } = await Product.findAndCountAll({ where, limit, offset, include: [Category], order: [['createdAt', 'DESC']] });
  return { items: rows, total: count };
}

export async function getProductById(id) {
  const product = await Product.findByPk(id, { include: [Category] });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

export async function createProduct(payload) {
  return Product.create(payload);
}

export async function updateProduct(id, payload) {
  const product = await getProductById(id);
  return product.update(payload);
}

export async function deleteProduct(id) {
  const product = await getProductById(id);
  await product.destroy();
  return { success: true };
}

