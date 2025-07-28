# Aplikasi E-Commerce Berbasis Microservice

Ini adalah proyek backend untuk aplikasi e-commerce yang dibangun menggunakan arsitektur microservice. Proyek ini bertujuan untuk mendemonstrasikan bagaimana beberapa layanan independen dapat bekerja sama di belakang sebuah API Gateway.

Setiap layanan memiliki database-nya sendiri dan berkomunikasi satu sama lain melalui panggilan API (HTTP).

---
## 🏛️ Arsitektur

Aplikasi ini terdiri dari beberapa komponen:

1.  **API Gateway** (`Port 3000`)
    * Bertindak sebagai satu-satunya titik masuk (*single entry point*) untuk semua permintaan dari klien.
    * Meneruskan permintaan ke layanan yang sesuai.
    * Dapat menangani otentikasi, *rate limiting*, dan logging.

2.  **User Service** (`Port 3001`)
    * Bertanggung jawab untuk registrasi dan login pengguna.
    * Mengelola data kredensial pengguna.

3.  **Customer Service** (`Port 3002`)
    * Bertanggung jawab untuk mengelola profil data pelanggan (CRUD).

4.  **Product Service** (`Port 3003`)
    * Bertanggung jawab untuk mengelola data produk, termasuk stok dan harga (CRUD).

5.  **Transaction Service** (`Port 3004`)
    * Meng-orkestrasi proses transaksi dengan berkomunikasi dengan *Customer Service* dan *Product Service*.

---
## 💻 Teknologi yang Digunakan

* **Node.js**: Lingkungan eksekusi JavaScript.
* **Express.js**: Kerangka kerja web untuk membangun API.
* **MySQL**: Sistem manajemen database relasional.
* **mysql2**: Driver MySQL untuk Node.js.
* **Axios**: Klien HTTP untuk komunikasi antar-service.
* **Dotenv**: Untuk mengelola variabel lingkungan (`.env`).
* **jsonwebtoken & bcrypt**: Untuk otentikasi (di User Service).

---
## 🚀 Instalasi dan Konfigurasi

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal.

### 1. Prasyarat

* [Node.js](https://nodejs.org/) (disarankan versi 18 atau lebih baru)
* Server MySQL (misalnya dari XAMPP, Laragon).

### 2. Clone Repository

```bash
git clone [URL_REPOSITORY]
cd [NAMA_FOLDER_REPOSITORY]
