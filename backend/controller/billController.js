const { createBill, getAllBills, getBillById, deleteBill, getBillStats } = require("../model/billModel");

const addBill = async (req, res) => {
  try {
    const { customer_id, items, discount, vat_rate } = req.body;
    if (!items || items.length === 0) {
      return res.json({ message: "Bill items are required" });
    }
    const bill = await createBill(
      customer_id || null,
      items,
      discount || 0,
      vat_rate || 13
    );
    if (bill) {
      res.json({ message: "Bill created successfully", bill: bill });
    }
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await getAllBills();
    res.json({ message: "success", bills: bills });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const getBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await getBillById(id);
    if (!bill) {
      return res.json({ message: "Bill not found" });
    }
    res.json({ message: "success", bill: bill });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const removeBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await deleteBill(id);
    if (!bill) {
      return res.json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await getBillStats();
    res.json({ message: "success", stats: stats });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

module.exports = { addBill, getBills, getBill, removeBill, getStats };