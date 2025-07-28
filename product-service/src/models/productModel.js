const pool = require("../config/db");

const ProductModel = {
  create: async (name, description, price, stock, imageUrl) => {
    const [result] = await pool.execute(
      "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, stock, imageUrl]
    );
    return result.insertId;
  },
  findById: async (id) => {
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
  getAll: async () => {
    const [rows] = await pool.execute("SELECT * FROM products");
    return rows;
  },
  update: async (id, productData) => {
    const fields = Object.keys(productData);
    const values = Object.values(productData);
    if (fields.length === 0) {
      return 0;
    }
    const setClauses = fields.map((field) => `${field} = ?`).join(", ");
    const sql = `UPDATE products SET ${setClauses} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  },
};

module.exports = ProductModel;
