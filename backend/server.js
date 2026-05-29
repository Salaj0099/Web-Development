const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./database/db");
const customerRoute = require("./route/customerRoute");
const productRoute = require("./route/productRoute");
const billRoute = require("./route/billRoute");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  console.log("Server is running");
  res.send("VAT Billing backend is running");
});

app.get("/db-test", async (req, res) => {
  const result = await pool.query("SELECT * FROM customers");
  res.json(result.rows);
});

app.use("/api/customer", customerRoute);
app.use("/api/product", productRoute);
app.use("/api/bill", billRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});