const pool = require("../database/db");

const createUser = async (name, email, password) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  return result.rows[0];
};

const existingUser = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

const saveResetToken = async (email, token, expiry) => {
  const result = await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 RETURNING *",
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
    "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2 RETURNING *",
    [password, id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  existingUser,
  saveResetToken,
  getUserByResetToken,
  updatePassword,
};