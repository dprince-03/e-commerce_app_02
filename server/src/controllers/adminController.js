import { createProduct, deleteProduct, updateProduct } from '../services/productService.js';
import { listCategories, upsertCategory, listUsers, updateUserRole } from '../services/adminService.js';

export async function createProductAdmin(req, res, next) {
  try {
    const prod = await createProduct(req.body);
    res.status(201).json(prod);
  } catch (err) { next(err); }
}

export async function updateProductAdmin(req, res, next) {
  try {
    const prod = await updateProduct(req.params.id, req.body);
    res.json(prod);
  } catch (err) { next(err); }
}

export async function deleteProductAdmin(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function categoriesGet(req, res, next) {
  try { res.json(await listCategories()); } catch (err) { next(err); }
}

export async function categoriesUpsert(req, res, next) {
  try { res.json(await upsertCategory(req.body)); } catch (err) { next(err); }
}

export async function usersList(req, res, next) {
  try { res.json(await listUsers()); } catch (err) { next(err); }
}

export async function userRoleUpdate(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await updateUserRole(id, role);
    res.json(updated);
  } catch (err) { next(err); }
}

