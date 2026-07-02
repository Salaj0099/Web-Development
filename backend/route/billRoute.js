const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { listBills, showBill, create, cancel, collect } = require("../controller/billController");

router.get("/all", protect, listBills);
router.post("/create", protect, create);
router.put("/:id/cancel", protect, cancel);
router.put("/:id/collect", protect, collect);
router.get("/:id", protect, showBill);

module.exports = router;
