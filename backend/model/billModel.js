const pool = require("../database/db");
const { recordMovementTx } = require("./stockModel");

const VAT_RATE = 0.13;
const FUEL_NAMES = { petrol: "Petrol", diesel: "Diesel", kerosene: "Kerosene" };

const badRequest = (message) => {
  const e = new Error(message);
  e.status = 400;
  return e;
};

const dateStr = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

// Shapes a DB row (+ its items) into the object the frontend already expects.
const toFrontBill = (b, items = []) => ({
  dbId: b.id,
  id: b.bill_no,
  customer: b.customer,
  pan: b.pan,
  address: b.address,
  vehicle: b.vehicle,
  payment: b.payment,
  status: b.status,
  amount: Number(b.amount),
  taxable: Number(b.taxable),
  vat: Number(b.vat),
  discount: Number(b.discount),
  litres: Number(b.litres),
  remarks: b.remarks,
  bankName: b.bank_name,
  chequeNo: b.cheque_no,
  chequeDate: b.cheque_date || null,
  chequeStatus: b.cheque_status,
  lines: items.map((i) => ({ fuel: i.name, key: i.product, qty: Number(i.qty), rate: Number(i.rate), amount: Number(i.amount) })),
  items: items.map((i) => `${i.name} — ${Number(i.qty)}L`).join(", "),
  date: dateStr(b.created_at),
  createdAt: new Date(b.created_at).getTime(),
  time: new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  collection: b.collected_at ? { method: b.payment, cleared: b.cleared, at: new Date(b.collected_at).getTime() } : null,
  cancelledAt: b.cancelled_at ? new Date(b.cancelled_at).getTime() : null,
  staff: b.staff,
});

const SELECT_BILL =
  `id, bill_no, customer, pan, address, vehicle, payment, status, taxable, vat, discount, amount,
   litres, remarks, bank_name, cheque_no, to_char(cheque_date,'YYYY-MM-DD') AS cheque_date, cheque_status,
   collected_at, cleared, staff, created_at, cancelled_at`;

const loadItems = async (runner, saleIds) => {
  if (!saleIds.length) return {};
  const { rows } = await runner.query(
    "SELECT sale_id, product, name, qty, rate, amount FROM sale_items WHERE sale_id = ANY($1) ORDER BY id",
    [saleIds]
  );
  const bySale = {};
  rows.forEach((r) => { (bySale[r.sale_id] = bySale[r.sale_id] || []).push(r); });
  return bySale;
};

const getAllBills = async ({ includeCancelled = false } = {}) => {
  const where = includeCancelled ? "" : "WHERE status <> 'cancelled'";
  const { rows } = await pool.query(`SELECT ${SELECT_BILL} FROM sales ${where} ORDER BY created_at DESC, id DESC`);
  const items = await loadItems(pool, rows.map((r) => r.id));
  return rows.map((b) => toFrontBill(b, items[b.id] || []));
};

const getBill = async (idOrNo) => {
  const byId = /^\d+$/.test(String(idOrNo));
  const { rows } = await pool.query(
    `SELECT ${SELECT_BILL} FROM sales WHERE ${byId ? "id = $1" : "bill_no = $1"}`,
    [idOrNo]
  );
  if (!rows.length) return null;
  const items = await loadItems(pool, [rows[0].id]);
  return toFrontBill(rows[0], items[rows[0].id] || []);
};

// Creates a bill and deducts the sold fuel from stock — all in one transaction,
// so a sale that would oversell any tank fails without leaving a half-written bill.
const createBill = async (data) => {
  const { customer, pan, address, vehicle, payment, discount, remarks, items, bank, staff } = data;

  if (!Array.isArray(items) || !items.length) throw badRequest("Add at least one item to the bill.");
  const clean = items.map((it) => {
    const product = it.product;
    if (!FUEL_NAMES[product]) throw badRequest("Choose a valid fuel for every line.");
    const qty = Number(it.qty);
    const rate = Number(it.rate);
    if (!(qty > 0)) throw badRequest("Every line needs a quantity greater than zero.");
    if (!(rate > 0)) throw badRequest("Every line needs a valid rate.");
    return { product, name: FUEL_NAMES[product], qty, rate, gross: qty * rate };
  });

  const method = ["Cash", "Credit", "Cheque", "QR Payment"].includes(payment) ? payment : "Cash";
  if ((method === "Credit" || method === "Cheque") && (!customer || !customer.trim())) {
    throw badRequest("Customer name is required for credit and cheque sales.");
  }
  let chequeStatus = null;
  if (method === "Cheque") {
    if (!bank || !bank.name || !bank.number || !bank.date) {
      throw badRequest("Enter the bank name, cheque number and cheque date.");
    }
    chequeStatus = bank.status === "cleared" ? "cleared" : "pending";
  }

  const subtotal = clean.reduce((s, it) => s + it.gross, 0);
  const disc = Number(discount) || 0;
  const net = Math.max(subtotal - disc, 0);
  const taxable = net / (1 + VAT_RATE);
  const vat = net - taxable;
  const litres = clean.reduce((s, it) => s + it.qty, 0);
  const scale = subtotal > 0 ? net / subtotal : 0;

  // Cash/QR are collected on the spot; a cleared cheque counts as collected too.
  // Credit and pending cheques are outstanding.
  const status =
    method === "Credit" ? "credit"
    : method === "Cheque" ? (chequeStatus === "cleared" ? "paid" : "credit")
    : "paid";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const billRes = await client.query(
      `INSERT INTO sales
        (bill_no, customer, pan, address, vehicle, payment, status, taxable, vat, discount, amount, litres,
         remarks, bank_name, cheque_no, cheque_date, cheque_status, staff)
       VALUES ('INV-' || LPAD(nextval('bill_no_seq')::text, 5, '0'),
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id, bill_no`,
      [
        customer ? customer.trim() : null, pan || null, address || null, vehicle || null,
        method, status, taxable.toFixed(2), vat.toFixed(2), disc.toFixed(2), net.toFixed(2), litres.toFixed(2),
        remarks || null,
        method === "Cheque" ? bank.name : null,
        method === "Cheque" ? bank.number : null,
        method === "Cheque" ? bank.date : null,
        chequeStatus, staff || null,
      ]
    );
    const billId = billRes.rows[0].id;
    const billNo = billRes.rows[0].bill_no;

    for (const it of clean) {
      await client.query(
        "INSERT INTO sale_items (sale_id, product, name, qty, rate, amount) VALUES ($1,$2,$3,$4,$5,$6)",
        [billId, it.product, it.name, it.qty, it.rate, (it.gross * scale).toFixed(2)]
      );
      // Deduct stock in the same transaction; overselling aborts the whole bill.
      await recordMovementTx(client, {
        product: it.product, type: "sale", quantity: it.qty, reference: billNo, staff,
      });
    }
    await client.query("COMMIT");
    return await getBill(billId);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

// Cancels a bill and returns its fuel to stock, atomically.
const cancelBill = async (id, staff) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT * FROM sales WHERE id = $1 FOR UPDATE", [id]);
    const bill = rows[0];
    if (!bill) { const e = new Error("Bill not found"); e.status = 404; throw e; }
    if (bill.status === "cancelled") throw badRequest("This bill is already cancelled.");

    const { rows: items } = await client.query("SELECT * FROM sale_items WHERE sale_id = $1", [id]);
    for (const it of items) {
      await recordMovementTx(client, {
        product: it.product, type: "adjustment", quantity: Number(it.qty),
        reason: "Bill cancelled", reference: bill.bill_no, staff,
      });
    }
    await client.query(
      "UPDATE sales SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1",
      [id]
    );
    await client.query("COMMIT");
    return await getBill(id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

// Marks an outstanding credit/cheque bill as collected (cleared).
const collectBill = async (id, { cleared, staff }) => {
  const { rows } = await pool.query("SELECT * FROM sales WHERE id = $1", [id]);
  const bill = rows[0];
  if (!bill) { const e = new Error("Bill not found"); e.status = 404; throw e; }
  if (bill.status !== "credit") throw badRequest("This bill has no outstanding balance.");
  if (!cleared) return await getBill(id); // "not cleared yet" — leave it outstanding

  const chequeStatus = bill.payment === "Cheque" ? "cleared" : bill.cheque_status;
  await pool.query(
    "UPDATE sales SET status = 'paid', collected_at = NOW(), cleared = TRUE, cheque_status = $2, staff = COALESCE($3, staff) WHERE id = $1",
    [id, chequeStatus, staff || null]
  );
  return await getBill(id);
};

module.exports = { getAllBills, getBill, createBill, cancelBill, collectBill };
