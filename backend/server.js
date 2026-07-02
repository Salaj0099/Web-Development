const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const pool = require("./database/db");
const userRoute = require("./route/userRoute");
const stockRoute = require("./route/stockRoute");
const supplierRoute = require("./route/supplierRoute");
const billRoute = require("./route/billRoute");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  console.log("Server is running");
  res.send("The backend is running");
});

app.use("/api/user", userRoute);
app.use("/api/stock", stockRoute);
app.use("/api/supplier", supplierRoute);
app.use("/api/bill", billRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});