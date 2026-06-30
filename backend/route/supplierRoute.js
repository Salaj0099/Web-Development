const { listDeliveries, recordDelivery, markReceived } = require("../controller/supplierController");
const protect = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/deliveries", protect, listDeliveries);
router.post("/deliveries", protect, recordDelivery);
router.put("/deliveries/:id/receive", protect, markReceived);

module.exports = router;
