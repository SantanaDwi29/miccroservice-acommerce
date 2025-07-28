require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const app = express();
const transactionRoutes = require("./routes/transactionRoutes");

app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.get("/", (req, res) => {
   res.send("Transaction Service API");
});
const PORT = process.env.PORT || 3004; // Port unik
app.listen(PORT, () => {
   console.log(`Transaction Service running on port ${PORT}`);
});