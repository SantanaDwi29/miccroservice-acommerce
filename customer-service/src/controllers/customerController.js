const CustomerModel = require("../models/customerModel");
const axios = require("axios"); // Pastikan axios sudah diinstal: npm install axios

const CustomerController = {

  createCustomer: async (req, res) => {
    const { userId, name, email, phone, address } = req.body;

    if (!userId || !name || !email) {
      return res
        .status(400)
        .json({ message: "User ID, name, and email are required" });
    }

    try {
      const userVerificationUrl = `${process.env.USER_SERVICE_URL}/api/users/${userId}`;
      console.log(`[CustomerService] Attempting to verify user ID ${userId} from user-service: ${userVerificationUrl}`);

   
      await axios.get(userVerificationUrl);

      const customerId = await CustomerModel.create(userId, name, email, phone, address);
      res.status(201).json({ message: "Customer created successfully", customerId });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        return res.status(404).json({ message: "User not found in User Service" });
      }
      console.error(
        "Error creating customer:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ message: "Error creating customer", error: error.message });
    }
  },


  getCustomerById: async (req, res) => {
    const { id } = req.params;
    try {
      const customer = await CustomerModel.findById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      let userInfo = {};
      if (customer.user_id) {
        try {
          const userLookupUrl = `${process.env.USER_SERVICE_URL}/api/users/${customer.user_id}`;
          console.log(`[CustomerService] Attempting to fetch user info for customer ${customer.id} (user_id: ${customer.user_id}) from user-service: ${userLookupUrl}`);

          const userResponse = await axios.get(userLookupUrl);
          delete userResponse.data.password;
          userInfo = userResponse.data;
        } catch (userError) {
          console.error(`Could not fetch user info for user_id: ${customer.user_id}: ${userError.message}`);
        }
      }

      const result = {
        customer_id: customer.id,
        user_id: customer.user_id, 
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        created_at: customer.created_at,
        user_info: userInfo, 
      };

      res.status(200).json(result);

    } catch (error) {
      console.error("Error getting customer by ID:", error.response ? error.response.data : error.message);
      res.status(500).json({ message: "Error getting customer" });
    }
  },

  getCustomerByUserId: async (req, res) => {
    const { userId } = req.params;
    try {
      const customer = await CustomerModel.findByUserId(userId);
      if (!customer) {
        return res
          .status(404)
          .json({ message: "Customer not found for this user ID" });
      }

      let userInfo = {};
      if (customer.user_id) {
        try {
          const userLookupUrl = `${process.env.USER_SERVICE_URL}/api/users/${customer.user_id}`;
          console.log(`[CustomerService] Attempting to fetch user info for user_id ${customer.user_id} from user-service: ${userLookupUrl}`);

          const userResponse = await axios.get(userLookupUrl);
          delete userResponse.data.password;
          userInfo = userResponse.data;
        } catch (userError) {
          console.error(`Could not fetch user info for user_id: ${customer.user_id}: ${userError.message}`);
        }
      }
      const responseWithUserInfo = { ...customer, user_info: userInfo };
      res.status(200).json(responseWithUserInfo);

    } catch (error) {
      console.error("Error getting customer by user ID:", error);
      res.status(500).json({ message: "Error getting customer" });
    }
  },


  getAllCustomers: async (req, res) => {
    try {
      const customers = await CustomerModel.getAll();

      const responseData = await Promise.all(
        customers.map(async (customer) => {
          let userInfo = {};
          if (customer.user_id) {
            try {
              const userLookupUrl = `${process.env.USER_SERVICE_URL}/api/users/${customer.user_id}`;
              console.log(`[CustomerService] Attempting to fetch user info for customer ${customer.id} (user_id: ${customer.user_id}) from user-service: ${userLookupUrl}`);

              const userResponse = await axios.get(userLookupUrl);
              delete userResponse.data.password; 
              userInfo = userResponse.data;
            } catch (e) {
              console.error(`Could not fetch user info for user_id: ${customer.user_id}: ${e.message}`);
            }
          }
          return {
            id: customer.id,
            user_info: userInfo,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            created_at: customer.created_at,
             
          };
        })
      );

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error getting all customers:", error);
      res.status(500).json({ message: "Error getting all customers" });
    }
  },

  updateCustomer: async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
      const affectedRows = await CustomerModel.update(
        id,
        name,
        email,
        phone,
        address
      );
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Customer not found or no changes made" });
      }
      res.status(200).json({ message: "Customer updated successfully" });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Error updating customer" });
    }
  },

  
  deleteCustomer: async (req, res) => {
    const { id } = req.params;
    try {
      const affectedRows = await CustomerModel.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Error deleting customer" });
    }
  },
};

module.exports = CustomerController;