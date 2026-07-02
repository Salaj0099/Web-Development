const { getAllBills, getBill, createBill, cancelBill, collectBill } = require("../model/billModel");

const listBills = async (req, res) => {
  try {
    const bills = await getAllBills({ includeCancelled: req.query.includeCancelled === "1" });
    return res.status(200).json({ bills });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const showBill = async (req, res) => {
  try {
    const bill = await getBill(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    return res.status(200).json({ bill });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const create = async (req, res) => {
  try {
    const bill = await createBill(req.body);
    return res.status(201).json({ message: "Bill created", bill });
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.status ? e.message : "unsuccessful" });
  }
};

const cancel = async (req, res) => {
  try {
    const bill = await cancelBill(req.params.id, req.body && req.body.staff);
    return res.status(200).json({ message: "Bill cancelled", bill });
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.status ? e.message : "unsuccessful" });
  }
};

const collect = async (req, res) => {
  try {
    const bill = await collectBill(req.params.id, {
      cleared: req.body && req.body.cleared,
      staff: req.body && req.body.staff,
    });
    return res.status(200).json({ message: "Bill updated", bill });
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.status ? e.message : "unsuccessful" });
  }
};

module.exports = { listBills, showBill, create, cancel, collect };
