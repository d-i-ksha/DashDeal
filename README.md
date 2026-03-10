DashDeal - Women's Fashion E-commerce API 👗✨
DashDeal is designed for a modern women's fashion store. It handles everything from secure user authentication to complex order transactions using the Indian Rupee (INR) currency.

Features
Secure Authentication: Implements industry-standard password hashing using Werkzeug to protect user data.

Diverse Product Catalog: Organized categories for Ethnic Wear, Western Wear, Jewelry, Footwear, and more.

Transactional Integrity: Uses SQL transactions to ensure orders and order items are saved accurately or rolled back on failure.

Modular MVC Architecture: Cleanly separated into Models, Routes, and Controllers for high scalability.

Tech Stack
Backend: Python / Flask

Database: MySQL

Security: Password Hashing (PBKDF2)

Tools: Thunder Client (Testing), Git/GitHub (Version Control)

API Endpoints

POST /register
POST /login
GET /products
POST /order
GET /orders