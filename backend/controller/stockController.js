const { getAllStock, getMovements, recordMovement } = require("../model/stockModel");

const listStock = async (req, res) => {
  try {
    const stock = await getAllStock();
    return res.status(200).json({ stock });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

// Generic movement endpoint used by sales (type "sale") and deliveries.
// Adjustments have their own endpoint below.
const updateStockLevel = async (req, res) => {
  try {
    const { product, type, quantity, reference, remarks, staff } = req.body;
    if (!product || quantity === undefined || quantity === "") {
      return res.status(400).json({ message: "field empty" });
    }
    const movement = ["delivery", "sale", "adjustment"].includes(type) ? type : "delivery";
    const { stock } = await recordMovement({ product, type: movement, quantity, reference, remarks, staff });
    return res.status(200).json({ message: "stock updated", stock });
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.status ? e.message : "unsuccessful" });
  }
};

const listMovements = async (req, res) => {
  try {
    const { product, type, limit } = req.query;
    const movements = await getMovements({
      product,
      type,
      limit: limit ? Number(limit) : 200,
    });
    return res.status(200).json({ movements });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { product, quantity, reason, remarks, staff } = req.body;
    if (!product || quantity === undefined || quantity === "" || Number(quantity) === 0) {
      return res.status(400).json({ message: "Enter an adjustment amount." });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please give a reason for the adjustment." });
    }
    const { stock, movement } = await recordMovement({
      product,
      type: "adjustment",
      quantity,
      reason: reason.trim(),
      remarks,
      staff,
      reference: "ADJ",
    });
    return res.status(200).json({ message: "Stock adjusted", stock, movement });
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.status ? e.message : "unsuccessful" });
  }
};

module.exports = { listStock, updateStockLevel, listMovements, adjustStock };
