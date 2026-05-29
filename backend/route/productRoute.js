const express = require("express");
const router = express.Router();
const { addProduct, getProducts, editProduct, removeProduct } = require("../controller/productController");

router.post("/create", addProduct);
router.get("/all", getProducts);
router.put("/update/:id", editProduct);
router.delete("/delete/:id", removeProduct);

module.exports = router;