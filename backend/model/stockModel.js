const pool = require("../database/db");

const getAllStock = async () => {
  const result = await pool.query("SELECT * FROM stocks ORDER BY id");
  return result.rows;
};

// type: "delivery" adds to current; "adjustment" sets current. Capped at capacity.
const updateStock = async (product, type, quantity) => {
  const qty = Number(quantity);
  const sql =
    type === "adjustment"
      ? `UPDATE stocks
           SET current_litres = GREATEST(LEAST($1, capacity_litres), 0), updated_at = NOW()
         WHERE product = $2 RETURNING *`
      : `UPDATE stocks
           SET current_litres = LEAST(current_litres + $1, capacity_litres), updated_at = NOW()
         WHERE product = $2 RETURNING *`;
  const result = await pool.query(sql, [qty, product]);
  return result.rows[0];
};

module.exports = { getAllStock, updateStock };
