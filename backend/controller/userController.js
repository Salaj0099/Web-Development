const {
  createUser,
  existingUser,
  saveResetToken,
  getUserByResetToken,
  updatePassword,
} = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "field empty",
      });
    }
    const existing = await existingUser(email);
    if (existing) {
      return res.status(400).json({
        message: "email already registered",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashpassword);
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    if (user) {
      res.status(201).json({
        message: "Created Successfully",
        user: user,
        token: token,
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "unsuccessful",
      e: e.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "field empty",
      });
    }
    const user = await existingUser(email);
    if (!user) {
      return res.status(404).json({
        message: "email is not registered",
      });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({
        message: "password does not match",
      });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    if (user) {
      res.status(200).json({
        message: "login successful",
        user: user,
        token: token,
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "not successful",
      e: e.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "field empty",
      });
    }
    const user = await existingUser(email);
    if (!user) {
      return res.status(404).json({
        message: "email is not registered",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000);
    await saveResetToken(email, token, expiry);
    console.log(`[OilDesk] Reset token for ${email}: ${token}`);
    res.status(200).json({
      message: "reset token generated",
      token: token,
    });
  } catch (e) {
    res.status(500).json({
      message: "unsuccessful",
      e: e.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        message: "field empty",
      });
    }
    const user = await getUserByResetToken(token);
    if (!user) {
      return res.status(400).json({
        message: "invalid or expired token",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    await updatePassword(user.id, hashpassword);
    res.status(200).json({
      message: "password reset successful",
    });
  } catch (e) {
    res.status(500).json({
      message: "unsuccessful",
      e: e.message,
    });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };