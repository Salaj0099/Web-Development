const pool = require("../database/db");

const getAllStock = async () => {
  const result = await pool.query("SELECT * FROM stocks ORDER BY id");
  return result.rows;
};

// type: "delivery" adds, "sale" subtracts, "adjustment" sets. Clamped to [0, capacity].
const updateStock = async (product, type, quantity) => {
  const qty = Number(quantity);
  let sql;
  if (type === "adjustment") {
    sql = `UPDATE stocks
             SET current_litres = GREATEST(LEAST($1, capacity_litres), 0), updated_at = NOW()
           WHERE product = $2 RETURNING *`;
  } else if (type === "sale") {
    sql = `UPDATE stocks
             SET current_litres = GREATEST(current_litres - $1, 0), updated_at = NOW()
           WHERE product = $2 RETURNING *`;
  } else {
    sql = `UPDATE stocks
             SET current_litres = LEAST(current_litres + $1, capacity_litres), updated_at = NOW()
           WHERE product = $2 RETURNING *`;
  }
  const result = await pool.query(sql, [qty, product]);
  return result.rows[0];
};

module.exports = { getAllStock, updateStock };
