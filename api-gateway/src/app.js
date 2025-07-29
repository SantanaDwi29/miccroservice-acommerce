require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const PORT = process.env.PORT || 3000;
// app.use(express.json());
// Proxy routes to respective microservices
app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite:{
        "^/(.*)": "/api/users/$1",
        "^/":"/api/users",
    },
  })
);
app.use(
  "/api/customers",
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite:{
         "^/(.*)": "/api/customers/$1",
        "^/":"/api/customers",
    },
  })
);
app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite:{
         "^/(.*)": "/api/products/$1",
        "^/":"/api/products",
    },
  })
);
app.use(
  "/api/transactions",
  createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite:{
         "^/(.*)": "/api/transactions/$1",
        "^/":"/api/transactions",
    },
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
