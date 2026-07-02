const pool = require("../database/db");

const getAllStock = async () => {
  const result = await pool.query("SELECT * FROM stocks ORDER BY id");
  return result.rows;
};

const MOVEMENT_FIELDS =
  "id, product, name, type, qty_in, qty_out, balance, reference, reason, remarks, staff, created_at";

const getMovements = async ({ product, type, limit = 200 } = {}) => {
  const params = [];
  const where = [];
  if (product) { params.push(product); where.push(`product = $${params.length}`); }
  if (type) { params.push(type); where.push(`type = $${params.length}`); }
  params.push(limit);
  const sql = `SELECT ${MOVEMENT_FIELDS} FROM stock_movements
               ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY created_at DESC, id DESC LIMIT $${params.length}`;
  const result = await pool.query(sql, params);
  return result.rows;
};

const badRequest = (message) => {
  const e = new Error(message);
  e.status = 400;
  return e;
};

// Applies one stock movement using an already-open transaction client, so it
// can be composed with other work (e.g. saving a bill) in a single atomic
// transaction. `type` is delivery | sale | adjustment. For adjustments,
// `quantity` is a signed delta (+ adds, - removes). Guards against overselling
// and against exceeding tank capacity. The caller owns BEGIN/COMMIT/ROLLBACK.
const recordMovementTx = async (client, { product, type, quantity, reference, reason, remarks, staff }) => {
  const qty = Number(quantity);
  const { rows } = await client.query(
    "SELECT * FROM stocks WHERE product = $1 FOR UPDATE",
    [product]
  );
  const stock = rows[0];
  if (!stock) {
    const e = new Error("Fuel not found");
    e.status = 404;
    throw e;
  }
  const current = Number(stock.current_litres);
  const capacity = Number(stock.capacity_litres);
  const room = capacity - current;

  let qtyIn = 0;
  let qtyOut = 0;
  let balance;

  if (type === "delivery") {
    if (!(qty > 0)) throw badRequest("Enter a delivery quantity greater than zero.");
    if (qty > room) throw badRequest(`This delivery exceeds tank capacity — only ${room.toLocaleString("en-IN")} L of space is left in the ${stock.name} tank.`);
    balance = current + qty;
    qtyIn = qty;
  } else if (type === "sale") {
    if (!(qty > 0)) throw badRequest("Sale quantity must be greater than zero.");
    if (qty > current) throw badRequest(`Not enough ${stock.name} in stock — only ${current.toLocaleString("en-IN")} L remaining.`);
    balance = current - qty;
    qtyOut = qty;
  } else if (type === "adjustment") {
    if (!qty || Number.isNaN(qty)) throw badRequest("Enter an adjustment amount.");
    balance = current + qty;
    if (balance < 0) throw badRequest(`This adjustment would drop ${stock.name} below zero — only ${current.toLocaleString("en-IN")} L is available to remove.`);
    if (balance > capacity) throw badRequest(`This adjustment would exceed the ${stock.name} tank capacity of ${capacity.toLocaleString("en-IN")} L.`);
    if (qty > 0) qtyIn = qty; else qtyOut = -qty;
  } else {
    throw badRequest("Unknown movement type.");
  }

  const updated = await client.query(
    "UPDATE stocks SET current_litres = $1, updated_at = NOW() WHERE product = $2 RETURNING *",
    [balance, product]
  );
  const movement = await client.query(
    `INSERT INTO stock_movements (product, name, type, qty_in, qty_out, balance, reference, reason, remarks, staff)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${MOVEMENT_FIELDS}`,
    [product, stock.name, type, qtyIn, qtyOut, balance, reference || null, reason || null, remarks || null, staff || null]
  );
  return { stock: updated.rows[0], movement: movement.rows[0] };
};

// Standalone movement (owns its own transaction).
const recordMovement = async (opts) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await recordMovementTx(client, opts);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAllStock, getMovements, recordMovement, recordMovementTx };
