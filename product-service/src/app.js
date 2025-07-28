require('dotenv').config({ path: __dirname + '/../.env' }); // Pastikan path benar 
const express = require('express'); 
const app = express(); 
const productRoutes = require('./routes/productRoutes'); 
app.use(express.json()); 
app.use('/api/products', productRoutes); 
app.get('/', (req, res) => { 
res.send('Product Service API'); 
}); 
const PORT = process.env.PORT || 3003; // Port unik 
app.listen(PORT, () => { 
console.log(`Product Service running on port ${PORT}`); 
}); 