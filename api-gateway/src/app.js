require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// Proxy routes to respective microservices
app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
  })
);
app.use(
  "/api/customers",
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL,
    changeOrigin: true,
  })
);
app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
  })
);
app.use(
  "/api/transactions",
  createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
  })
);
// Basic route for the gateway
app.get("/", (req, res) => {
  res.send("API Gateway for E-commerce Microservices");
});
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Frontend can access all services via 
http://localhost:${PORT}/api/...`);
});
