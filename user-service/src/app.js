require('dotenv').config({ path: __dirname + '/../.env' }); // Pastikan path benar 
const express = require('express'); 
const app = express(); 
const userRoutes = require('./routes/userRoutes'); 
app.use(express.json()); 
app.use('/api/users', userRoutes); 
app.get('/', (req, res) => { 
res.send('User Service API'); 
}); 
const PORT = process.env.PORT || 3001; // Port unik 
app.listen(PORT, () => { 
console.log(`User Service running on port ${PORT}`); 
}); 