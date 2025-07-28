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

### 3. Database Set Up
A. Crerate  Database
   CREATE DATABASE user_db;
   CREATE DATABASE customer_db;
   CREATE DATABASE product_db;
   CREATE DATABASE transaction_db;
