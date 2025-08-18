import { listProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../services/productService.js';

export async function list(req, res, next) {
  try {
    const { limit, offset, categoryId } = req.query;
    const result = await listProducts({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      categoryId
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const created = await createProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

