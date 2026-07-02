const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  listStock,
  updateStockLevel,
  listMovements,
  adjustStock,
} = require("../controller/stockController");

router.get("/", protect, listStock);
router.get("/movements", protect, listMovements);
router.post("/update", protect, updateStockLevel);
router.post("/adjust", protect, adjustStock);

module.exports = router;
