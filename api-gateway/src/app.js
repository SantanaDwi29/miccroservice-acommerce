require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// PENTING: app.use(express.json()) dihapus dari sini untuk menghindari error 'request aborted'.
// Gateway hanya meneruskan request, tidak memproses body-nya.

// Konfigurasi Proxy dengan pathRewrite
app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/users': '', // Menghapus /api/users dari path
    }
}));

app.use('/api/customers', createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/customers': '', // Menghapus /api/customers dari path
    }
}));

app.use('/api/products', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/products': '', // Menghapus /api/products dari path
    }
}));

app.use('/api/transactions', createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/transactions': '', // Menghapus /api/transactions dari path
    }
}));

app.get('/', (req, res) => {
    res.send('API Gateway for E-commerce Microservices');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});