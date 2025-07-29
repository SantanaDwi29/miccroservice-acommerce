const TransactionModel = require("../models/transactionModel");
const axios = require("axios");
const pool = require("../config/db");

const TransactionController = {

  createTransaction: async (req, res) => {
    const { customerId, items } = req.body;
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Customer ID and items are required" });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validasi Customer via API call
      try {
        console.log(`[TransactionService] Validating customer ${customerId} from: ${process.env.CUSTOMER_SERVICE_URL}/api/customers/${customerId}`);
        await axios.get(
          `${process.env.CUSTOMER_SERVICE_URL}/api/customers/${customerId}`
        );
      } catch (error) {
        await connection.rollback();
        console.error(
          "Error validating customer:",
          axios.isAxiosError(error) ? error.response?.data || error.message : error.message
        );
        return res
          .status(404) // Use 404 specifically if customer not found
          .json({ message: "Customer not found in Customer Service" });
      }

      // 2. Validasi semua produk dan stoknya via API call
      let totalAmount = 0;
      const validatedItems = [];
      for (const item of items) {
        try {
          console.log(`[TransactionService] Validating product ${item.productId} stock from: ${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
          const productResponse = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`
          );
          const product = productResponse.data;
          if (product.stock < item.quantity) {
            await connection.rollback();
            return res
              .status(400)
              .json({ message: `Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` });
          }
          totalAmount += product.price * item.quantity;
          validatedItems.push({
            productId: product.id,
            quantity: item.quantity,
            pricePerItem: product.price,
            stockBefore: product.stock, // Keep original stock for update calculation
          });
        } catch (productError) {
          await connection.rollback();
          console.error(
            `Error validating product ${item.productId}:`,
            axios.isAxiosError(productError) ? productError.response?.data || productError.message : productError.message
          );
          return res.status(404).json({ message: `Product ${item.productId} not found or inaccessible in Product Service` });
        }
      }

      // 3. Simpan transaksi utama ke DB lokal
      const [transResult] = await connection.execute(
        "INSERT INTO transactions (customer_id, total_amount, status) VALUES (?, ?, ?)",
        [customerId, totalAmount, "pending"]
      );
      const transactionId = transResult.insertId;

      // 4. Simpan item-item transaksi ke DB lokal
      for (const item of validatedItems) {
        await connection.execute(
          "INSERT INTO transaction_items (transaction_id, product_id, quantity, price_per_item) VALUES (?, ?, ?, ?)",
          [transactionId, item.productId, item.quantity, item.pricePerItem]
        );
      }

      // 5. Kurangi stok produk melalui API call
      // Use Promise.all to update stocks concurrently for performance
      await Promise.all(validatedItems.map(async (item) => {
        const updateStockUrl = `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`;
        const newStock = item.stockBefore - item.quantity;
        console.log(`[TransactionService] Updating stock for product ${item.productId} to ${newStock} via: ${updateStockUrl}`);
        await axios.put(
          updateStockUrl,
          { stock: newStock }
        );
      }));

      await connection.commit();
      res
        .status(201)
        .json({ message: "Transaction created successfully", transactionId });
    } catch (error) {
      await connection.rollback();
      console.error(
        "Error creating transaction:",
        axios.isAxiosError(error) ? error.response?.data || error.message : error.message
      );
      res.status(500).json({
        message: "Error creating transaction, transaction rolled back",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  },

  enrichItemsWithProductDetails: async (items) => {
    const productCache = new Map();
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (productCache.has(item.product_id)) {
          return { ...item, product_name: productCache.get(item.product_id) };
        }

        try {
          const productResponse = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`
          );
          const productName = productResponse.data.name;
          productCache.set(item.product_id, productName);
          return { ...item, product_name: productName };
        } catch (e) {
          console.error(`Could not fetch product info for product_id: ${item.product_id}: ${e.message}`);
          productCache.set(item.product_id, "Product Not Found"); 
          return { ...item, product_name: "Product Not Found" };
        }
      })
    );
    return enrichedItems;
  },


  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;

      const rawTransactionItems = await TransactionModel.findById(id);

      if (rawTransactionItems.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const enrichedItems =
        await TransactionController.enrichItemsWithProductDetails(
          rawTransactionItems
        );

      const transaction = {
        id: rawTransactionItems[0].id,
        customer_id: rawTransactionItems[0].customer_id,
        total_amount: rawTransactionItems[0].total_amount,
        status: rawTransactionItems[0].status,
        transaction_date: rawTransactionItems[0].transaction_date,
        items: enrichedItems.map(item => ({ 
          item_id: item.item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price_per_item: item.price_per_item,
        })),
      };

      res.status(200).json(transaction);
    } catch (error) {
      console.error("Error getting transaction by ID:", error);
      res.status(500).json({ message: "Error getting transaction" });
    }
  },

  
  getTransactionsByCustomerId: async (req, res) => {
    try {
      const { customerId } = req.params;
      const rawAllItems = await TransactionModel.findByCustomerId(customerId);
      if (rawAllItems.length === 0) {
        return res
          .status(404) 
          .json({ message: "No transactions found for this customer" });
      }

   
      const enrichedItems =
        await TransactionController.enrichItemsWithProductDetails(rawAllItems);

      const transactionsMap = new Map();
      enrichedItems.forEach((item) => {
        if (!transactionsMap.has(item.id)) { 
          transactionsMap.set(item.id, {
            id: item.id,
            customer_id: item.customer_id,
            total_amount: item.total_amount,
            status: item.status,
            transaction_date: item.transaction_date,
            items: [], 
          });
        }
     
        transactionsMap.get(item.id).items.push({
          item_id: item.item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price_per_item: item.price_per_item,
        });
      });

      res.status(200).json(Array.from(transactionsMap.values()));
    } catch (error) {
      console.error("Error getting transactions by customer ID:", error);
      res.status(500).json({ message: "Error getting transactions" });
    }
  },


  getAllTransactions: async (req, res) => {
    try {
      const rawTransactionItems = await TransactionModel.getAll();
      if (rawTransactionItems.length === 0) {
        return res.status(200).json([])
      }

      const enrichedItems = await TransactionController.enrichItemsWithProductDetails(rawTransactionItems);

      const transactionsMap = new Map();
      enrichedItems.forEach((item) => {
        if (!transactionsMap.has(item.id)) {
          transactionsMap.set(item.id, {
            id: item.id,
            customer_id: item.customer_id,
            total_amount: item.total_amount,
            status: item.status,
            transaction_date: item.transaction_date,
            items: [],
          });
        }
        transactionsMap.get(item.id).items.push({
          item_id: item.item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price_per_item: item.price_per_item,
        });
      });
      res.status(200).json(Array.from(transactionsMap.values()));
    } catch (error) {
      console.error("Error getting all transactions:", error);
      res.status(500).json({ message: "Error getting all transactions" });
    }
  },


  updateTransactionStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided. Must be 'pending', 'completed', or 'cancelled'." });
    }
    try {
      const affectedRows = await TransactionModel.updateStatus(id, status);
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Transaction not found or no changes made" });
      }
      res
        .status(200)
        .json({ message: "Transaction status updated successfully" });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Error updating transaction status" });
    }
  },


  deleteTransaction: async (req, res) => {
    const { id } = req.params;
    try {
      const affectedRows = await TransactionModel.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Error deleting transaction" });
    }
  },
};

module.exports = TransactionController;