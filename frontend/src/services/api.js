import axios from "axios";

const API = axios.create({ baseURL: "/api" });

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

// Auth
export const signUp = (data) => API.post("/user/register", data);
export const signIn = (data) => API.post("/user/login", data);