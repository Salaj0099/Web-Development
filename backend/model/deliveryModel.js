const pool = require("../database/db");

const FIELDS =
  "id, product, name, quantity, rate, total_amount, invoice_no, to_char(delivery_date, 'YYYY-MM-DD') AS delivery_date, status, remarks, created_at";

const getAllDeliveries = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM deliveries ORDER BY delivery_date DESC, id DESC`
  );
  return result.rows;
};

const getDeliveryById = async (id) => {
  const result = await pool.query(`SELECT ${FIELDS} FROM deliveries WHERE id = $1`, [id]);
  return result.rows[0];
};

const getDeliveryByInvoice = async (invoiceNo) => {
  const result = await pool.query(
    "SELECT id FROM deliveries WHERE LOWER(invoice_no) = LOWER($1)",
    [invoiceNo]
  );
  return result.rows[0];
};

const createDelivery = async (d) => {
  const result = await pool.query(
    `INSERT INTO deliveries (product, name, quantity, rate, total_amount, invoice_no, delivery_date, status, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ${FIELDS}`,
    [d.product, d.name, d.quantity, d.rate, d.totalAmount, d.invoiceNo, d.deliveryDate, d.status, d.remarks || null]
  );
  return result.rows[0];
};

const setDeliveryReceived = async (id) => {
  const result = await pool.query(
    `UPDATE deliveries SET status = 'received' WHERE id = $1 RETURNING ${FIELDS}`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAllDeliveries,
  getDeliveryById,
  getDeliveryByInvoice,
  createDelivery,
  setDeliveryReceived,
};
