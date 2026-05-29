const express = require("express");
const router = express.Router();
const { addBill, getBills, getBill, removeBill, getStats } = require("../controller/billController");

router.post("/create", addBill);
router.get("/all", getBills);
router.get("/stats", getStats);
router.get("/:id", getBill);
router.delete("/delete/:id", removeBill);

module.exports = router;