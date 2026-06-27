const { getAllStock, updateStock } = require("../model/stockModel");

const listStock = async (req, res) => {
  try {
    const stock = await getAllStock();
    return res.status(200).json({ stock });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const updateStockLevel = async (req, res) => {
  try {
    const { product, type, quantity } = req.body;
    if (!product || quantity === undefined || quantity === "") {
      return res.status(400).json({ message: "field empty" });
    }
    const movement = type === "adjustment" ? "adjustment" : "delivery";
    const updated = await updateStock(product, movement, quantity);
    if (!updated) {
      return res.status(404).json({ message: "product not found" });
    }
    return res.status(200).json({ message: "stock updated", stock: updated });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

module.exports = { listStock, updateStockLevel };
