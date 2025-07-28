# Microservice-Based E-Commerce Application

This is a simple backend project for an e-commerce application built using a microservice architecture. This project aims to demonstrate how several independent services can work together behind an API Gateway.

Each service has its own database and communicates with others via API (HTTP) calls.

---
## 🏛️ Architecture

This application consists of several components:

1.  **API Gateway** (`Port 3000`)
    * Acts as the single entry point for all requests from the client.
    * Forwards requests to the appropriate service.
    * Can handle authentication, rate limiting, and logging.

2.  **User Service** (`Port 3001`)
    * Responsible for user registration and login.
    * Manages user credential data.

3.  **Customer Service** (`Port 3002`)
    * Responsible for managing customer profile data (CRUD).

4.  **Product Service** (`Port 3003`)
    * Responsible for managing product data, including stock and price (CRUD).

5.  **Transaction Service** (`Port 3004`)
    * Orchestrates the transaction process by communicating with the Customer Service and Product Service.

---
## 💻 Tech Stack

* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web framework for building APIs.
* **MySQL**: Relational database management system.
* **mysql2**: MySQL driver for Node.js.
* **Axios**: HTTP client for inter-service communication.
* **Dotenv**: For managing environment variables (`.env`).
* **jsonwebtoken & bcrypt**: For authentication (in User Service).

---
## 🚀 Installation and Setup

Follow these steps to run the project locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* A MySQL Server (e.g., from XAMPP, Laragon, or a standalone installation).

### 2. Clone the Repository

```bash
git clone [REPOSITORY_URL]
cd [REPOSITORY_FOLDER_NAME]
```
### 3. Database Set Up
A. Crerate  Database
   CREATE DATABASE user_db;
   CREATE DATABASE customer_db;
   CREATE DATABASE product_db;
   CREATE DATABASE transaction_db;
B. Create Table
   user_db -> create:
 USE user_db; 
CREATE TABLE users ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
username VARCHAR(255) NOT NULL UNIQUE, 
password VARCHAR(255) NOT NULL, 
role ENUM('admin', 'customer') DEFAULT 'customer', 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

customer_db create:
USE customer_db; 
CREATE TABLE customers ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
user_id INT UNIQUE, -- Ini akan menjadi referensi ke user
service, tapi tidak ada FK langsung 
name VARCHAR(255) NOT NULL, 
email VARCHAR(255) NOT NULL UNIQUE, 
phone VARCHAR(50), 
address TEXT, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

product_db create:
USE product_db; 
CREATE TABLE products ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
name VARCHAR(255) NOT NULL, 
description TEXT, 
price DECIMAL(10, 2) NOT NULL, 
stock INT NOT NULL DEFAULT 0, 
image_url VARCHAR(255), 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

transaction_db create:
USE transaction_db; 
CREATE TABLE transactions ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
customer_id INT NOT NULL, -- Ini akan menjadi referensi ke 
customer-service 
total_amount DECIMAL(10, 2) NOT NULL, 
status ENUM('pending', 'completed', 'cancelled') DEFAULT 
'pending', 
transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
CREATE TABLE transaction_items ( 
id INT AUTO_INCREMENT PRIMARY KEY, 
transaction_id INT NOT NULL, 
product_id INT NOT NULL, 
quantity INT NOT NULL, 
price_per_item DECIMAL(10, 2) NOT NULL, 
FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON 
DELETE CASCADE 
); 


