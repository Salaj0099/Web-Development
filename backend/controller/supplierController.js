const {
  getAllDeliveries,
  getDeliveryById,
  getDeliveryByInvoice,
  createDelivery,
  setDeliveryReceived,
} = require("../model/deliveryModel");
const { updateStock } = require("../model/stockModel");

// The station buys only from Nepal Oil Corporation — a fixed business fact,
// not a managed list. These are NOC's public head-office details.
const SUPPLIER = {
  name: "Nepal Oil Corporation",
  phone: "01-4474922",
  email: "info@noc.org.np",
  website: "noc.org.np",
  address: "Babar Mahal, Kathmandu, Nepal",
  status: "Active",
};

const FUEL_NAMES = { petrol: "Petrol", diesel: "Diesel", kerosene: "Kerosene" };

const listDeliveries = async (req, res) => {
  try {
    const deliveries = await getAllDeliveries();
    return res.status(200).json({ supplier: SUPPLIER, deliveries });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const recordDelivery = async (req, res) => {
  try {
    const { product, quantity, rate, invoiceNo, deliveryDate, status, remarks } = req.body;

    if (!FUEL_NAMES[product]) {
      return res.status(400).json({ message: "Select a valid fuel type" });
    }
    const qty = Number(quantity);
    const price = Number(rate);
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: "Enter a quantity greater than zero" });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ message: "Enter a valid purchase rate" });
    }
    if (!invoiceNo || !invoiceNo.trim()) {
      return res.status(400).json({ message: "Invoice / reference number is required" });
    }
    if (!deliveryDate) {
      return res.status(400).json({ message: "Select the delivery date" });
    }
    const existing = await getDeliveryByInvoice(invoiceNo.trim());
    if (existing) {
      return res.status(409).json({ message: "A delivery with this invoice number already exists" });
    }

    const finalStatus = status === "pending" ? "pending" : "received";
    const delivery = await createDelivery({
      product,
      name: FUEL_NAMES[product],
      quantity: qty,
      rate: price,
      totalAmount: Number((qty * price).toFixed(2)),
      invoiceNo: invoiceNo.trim(),
      deliveryDate,
      status: finalStatus,
      remarks,
    });

    // Received deliveries top up the tank immediately.
    if (finalStatus === "received") {
      await updateStock(product, "delivery", qty);
    }

    return res.status(201).json({ message: "Delivery recorded", delivery });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

const markReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    if (delivery.status === "received") {
      return res.status(400).json({ message: "This delivery is already received" });
    }
    const updated = await setDeliveryReceived(id);
    await updateStock(delivery.product, "delivery", delivery.quantity);
    return res.status(200).json({ message: "Delivery received", delivery: updated });
  } catch (e) {
    return res.status(500).json({ message: "unsuccessful", e: e.message });
  }
};

module.exports = { listDeliveries, recordDelivery, markReceived };
