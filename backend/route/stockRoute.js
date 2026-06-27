const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { listStock, updateStockLevel } = require("../controller/stockController");

router.get("/", protect, listStock);
router.post("/update", protect, updateStockLevel);

module.exports = router;
