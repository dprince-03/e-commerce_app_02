import { createOrder, getOrderById, listUserOrders } from '../services/orderService.js';

export async function create(req, res, next) {
  try {
    const order = await createOrder({ customerId: req.user.id, items: req.body.items || [] });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const order = await getOrderById(req.params.id, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req, res, next) {
  try {
    const orders = await listUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

