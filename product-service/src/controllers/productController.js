const ProductModel = require("../models/productModel");

const ProductController = {
  createProduct: async (req, res) => {
    const { name, description, price, stock, imageUrl } = req.body;
    if (name === undefined || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ message: "Name, price, and stock are required" });
    }
    try {
      const productId = await ProductModel.create(
        name,
        description,
        price,
        stock,
        imageUrl
      );
      res
        .status(201)
        .json({ message: "Product created successfully", productId });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  },
  getProductById: async (req, res) => {
    const { id } = req.params;
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      res.status(500).json({ message: "Error getting product" });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const existingProduct = await ProductModel.findById(id);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const dataToUpdate = {
        name: req.body.name || existingProduct.name,
        description: req.body.description || existingProduct.description,
        price:
          req.body.price !== undefined ? req.body.price : existingProduct.price,
        stock:
          req.body.stock !== undefined ? req.body.stock : existingProduct.stock,
        image_url: req.body.image_url || existingProduct.image_url,
      };

      Object.keys(dataToUpdate).forEach((key) => {
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key];
        }
      });

      const affectedRows = await ProductModel.update(id, dataToUpdate);

      if (affectedRows > 0) {
        res.status(200).json({ message: "Product updated successfully" });
      } else {
        res
          .status(200)
          .json({ message: "Product data is already up to date." });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  },
  
  deleteProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const affectedRows = await ProductModel.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAll();
      res.status(200).json(products);
    } catch (error) {
      console.error("Error getting all products:", error);
      res.status(500).json({ message: "Error getting all products" });
    }
  },
};

module.exports = ProductController;
