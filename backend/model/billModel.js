const pool = require("../database/db");

const generateBillNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${year}-${rand}`;
};

const createBill = async (customer_id, items, discount, vat_rate) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxable_amount = subtotal - discount;
    const vat_amount = (taxable_amount * vat_rate) / 100;
    const total_amount = taxable_amount + vat_amount;
    const bill_no = generateBillNo();

    const billResult = await client.query(
      `INSERT INTO bills (bill_no, customer_id, subtotal, discount, taxable_amount, vat_rate, vat_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [bill_no, customer_id || null, subtotal, discount, taxable_amount, vat_rate, vat_amount, total_amount]
    );

    const bill = billResult.rows[0];

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      await client.query(
        `INSERT INTO bill_items (bill_id, product_id, product_name, quantity, unit_price, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [bill.id, item.product_id || null, item.product_name, item.quantity, item.unit_price, itemTotal]
      );
    }

    await client.query("COMMIT");
    return bill;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const getAllBills = async () => {
  const result = await pool.query(
    `SELECT b.*, c.name as customer_name, c.phone as customer_phone
     FROM bills b
     LEFT JOIN customers c ON b.customer_id = c.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
};

const getBillById = async (id) => {
  const billResult = await pool.query(
    `SELECT b.*, c.name as customer_name, c.address as customer_address, c.pan_no as customer_pan
     FROM bills b
     LEFT JOIN customers c ON b.customer_id = c.id
     WHERE b.id = $1`,
    [id]
  );
  const bill = billResult.rows[0];
  if (!bill) return null;

  const itemsResult = await pool.query(
    "SELECT * FROM bill_items WHERE bill_id = $1",
    [id]
  );
  bill.items = itemsResult.rows;
  return bill;
};

const deleteBill = async (id) => {
  const result = await pool.query(
    "DELETE FROM bills WHERE id=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

const getBillStats = async () => {
  const totalBills = await pool.query("SELECT COUNT(*) FROM bills");
  const totalRevenue = await pool.query(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM bills"
  );
  const totalVAT = await pool.query(
    "SELECT COALESCE(SUM(vat_amount), 0) as total FROM bills"
  );
  const totalCustomers = await pool.query("SELECT COUNT(*) FROM customers");

  return {
    total_bills: parseInt(totalBills.rows[0].count),
    total_revenue: parseFloat(totalRevenue.rows[0].total),
    total_vat_collected: parseFloat(totalVAT.rows[0].total),
    total_customers: parseInt(totalCustomers.rows[0].count),
  };
};

module.exports = { createBill, getAllBills, getBillById, deleteBill, getBillStats };