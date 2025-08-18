import { Product, Category, User } from '../models/index.js';
import { USER_ROLES } from '../utils/constants.js';

export async function upsertCategory({ id, name }) {
  if (id) {
    const category = await Category.findByPk(id);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
    return category.update({ name });
  }
  return Category.create({ name });
}

export async function listCategories() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

export async function listUsers() {
  return User.findAll({ attributes: ['id', 'email', 'name', 'role', 'createdAt'] });
}

export async function updateUserRole(userId, role) {
  if (!Object.values(USER_ROLES).includes(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  await user.update({ role });
  return { id: user.id, role: user.role };
}

