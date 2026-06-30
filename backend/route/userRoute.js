const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  editProfile,
  changePassword,
} = require("../controller/userController");
const protect = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authenticated account management
router.get("/me", protect, getMe);
router.put("/profile", protect, editProfile);
router.put("/password", protect, changePassword);

module.exports = router;