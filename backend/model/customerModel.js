const pool = require("../database/db");

const createCustomer = async (name, email, phone, address, pan_no) => {
  const result = await pool.query(
    "INSERT INTO customers (name, email, phone, address, pan_no) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, phone, address, pan_no]
  );
  return result.rows[0];
};

const getAllCustomers = async () => {
  const result = await pool.query(
    "SELECT * FROM customers ORDER BY created_at DESC"
  );
  return result.rows;
};

const updateCustomer = async (id, name, email, phone, address, pan_no) => {
  const result = await pool.query(
    "UPDATE customers SET name=$1, email=$2, phone=$3, address=$4, pan_no=$5 WHERE id=$6 RETURNING *",
    [name, email, phone, address, pan_no, id]
  );
  return result.rows[0];
};

const deleteCustomer = async (id) => {
  const result = await pool.query(
    "DELETE FROM customers WHERE id=$1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = { createCustomer, getAllCustomers, updateCustomer, deleteCustomer };