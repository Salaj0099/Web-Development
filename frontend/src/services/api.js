import axios from "axios";

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (_) {}
  }
  return config;
});

// Customers
export const createCustomer = (data) => API.post("/customer/create", data);
export const getAllCustomers = () => API.get("/customer/all");
export const updateCustomer = (id, data) => API.put(`/customer/update/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customer/delete/${id}`);

// Products
export const createProduct = (data) => API.post("/product/create", data);
export const getAllProducts = () => API.get("/product/all");
export const updateProduct = (id, data) => API.put(`/product/update/${id}`, data);
export const deleteProduct = (id) => API.delete(`/product/delete/${id}`);

// Bills
export const createBill = (data) => API.post("/bill/create", data);
export const getAllBills = () => API.get("/bill/all");
export const getBill = (id) => API.get(`/bill/${id}`);
export const deleteBill = (id) => API.delete(`/bill/delete/${id}`);
export const getBillStats = () => API.get("/bill/stats");

// Stock
export const getStocks = () => API.get("/stock");
export const updateStock = (data) => API.post("/stock/update", data);

// Supplier (Nepal Oil Corporation) deliveries
export const getDeliveries = () => API.get("/supplier/deliveries");
export const recordDelivery = (data) => API.post("/supplier/deliveries", data);
export const receiveDelivery = (id) => API.put(`/supplier/deliveries/${id}/receive`);

// Auth
export const signUp = (data) => API.post("/user/register", data);
export const signIn = (data) => API.post("/user/login", data);
export const forgotPassword = (data) => API.post("/user/forgot-password", data);
export const resetPassword = (data) => API.post("/user/reset-password", data);

// Account (authenticated)
export const getMe = () => API.get("/user/me");
export const updateProfile = (data) => API.put("/user/profile", data);
export const changePassword = (data) => API.put("/user/password", data);