const pool = require("../database/db");

const createProduct = async (name, description, unit_price, unit) => {
  const result = await pool.query(
    "INSERT INTO products (name, description, unit_price, unit) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, description, unit_price, unit]
  );
  return result.rows[0];
};

const getAllProducts = async () => {
  const result = await pool.query(
    "SELECT * FROM products ORDER BY name ASC"
  );
  return result.rows;
};

const updateProduct = async (id, name, description, unit_price, unit) => {
  const result = await pool.query(
    "UPDATE products SET name=$1, description=$2, unit_price=$3, unit=$4 WHERE id=$5 RETURNING *",
    [name, description, unit_price, unit, id]
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };