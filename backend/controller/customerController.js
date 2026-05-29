const { createCustomer, getAllCustomers, updateCustomer, deleteCustomer } = require("../model/customerModel");

const addCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, pan_no } = req.body;
    if (!name) {
      return res.json({ message: "Name is required" });
    }
    const customer = await createCustomer(name, email, phone, address, pan_no);
    if (customer) {
      res.json({ message: "Customer created successfully", customer: customer });
    }
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json({ message: "success", customers: customers });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, pan_no } = req.body;
    const customer = await updateCustomer(id, name, email, phone, address, pan_no);
    if (!customer) {
      return res.json({ message: "Customer not found" });
    }
    res.json({ message: "Customer updated successfully", customer: customer });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

const removeCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await deleteCustomer(id);
    if (!customer) {
      return res.json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (e) {
    res.json({ message: "unsuccessful", e: e.message });
  }
};

module.exports = { addCustomer, getCustomers, editCustomer, removeCustomer };