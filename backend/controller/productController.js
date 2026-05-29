const { createProduct, getAllProducts, updateProduct, deleteProduct } = require("../model/productModel");

const addProduct = async (req, res) => {
  try {
    const { name, description, unit_price, unit } = req.body;
    if (!name || !unit_price) {
      return res.json({ message: "Name and unit price are required" });
    }
    const product = await createProduct(name, description, unit_price, unit || "pcs");
    if (product) {
      res.json({ message: "Product created successfully", product: product });
    }
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ message: "success", products: products });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, unit_price, unit } = req.body;
    const product = await updateProduct(id, name, description, unit_price, unit);
    if (!product) {
      return res.json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product: product });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await deleteProduct(id);
    if (!product) {
      return res.json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

module.exports = { addProduct, getProducts, editProduct, removeProduct };