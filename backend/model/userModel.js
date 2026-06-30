const pool = require("../database/db");

// Columns safe to return to the client (never expose password / reset token)
const PUBLIC_FIELDS = "id, name, email, store_name, vat_number, created_at";

const createUser = async (name, email, password, storeName, vatNumber) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, store_name, vat_number) VALUES ($1, $2, $3, $4, $5) RETURNING ${PUBLIC_FIELDS}`,
    [name, email, password, storeName || null, vatNumber || null]
  );
  return result.rows[0];
};

// Returns the full row (including password) — for internal auth checks only.
const existingUser = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

const saveResetToken = async (email, token, expiry) => {
  const result = await pool.query(
    `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 RETURNING ${PUBLIC_FIELDS}`,
    [token, expiry, email]
  );
  return result.rows[0];
};

const getUserByResetToken = async (token) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
    [token]
  );
  return result.rows[0];
};

const updatePassword = async (id, password) => {
  const result = await pool.query(
    `UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2 RETURNING ${PUBLIC_FIELDS}`,
    [password, id]
  );
  return result.rows[0];
};

// Returns the full row (including password) by id — for internal auth checks only.
const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const updateProfile = async (id, { name, storeName, vatNumber }) => {
  const result = await pool.query(
    `UPDATE users SET name = $1, store_name = $2, vat_number = $3 WHERE id = $4 RETURNING ${PUBLIC_FIELDS}`,
    [name, storeName || null, vatNumber || null, id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  existingUser,
  saveResetToken,
  getUserByResetToken,
  updatePassword,
  getUserById,
  updateProfile,
};
