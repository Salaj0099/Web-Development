const express = require("express");
const router = express.Router();
const { addCustomer, getCustomers, editCustomer, removeCustomer } = require("../controller/customerController");

router.post("/create", addCustomer);
router.get("/all", getCustomers);
router.put("/update/:id", editCustomer);
router.delete("/delete/:id", removeCustomer);

module.exports = router;