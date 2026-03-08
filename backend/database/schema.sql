-- 1. Setup the Database
CREATE DATABASE IF NOT EXISTS dashdeal;
USE dashdeal;

-- 2. Users Table (Updated for Hashed Passwords)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 4. Deals (Products) Table
CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    original_price DECIMAL(12, 2) NOT NULL,
    discount_price DECIMAL(12, 2) NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    deal_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_at_purchase DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    deal_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- 8. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    deal_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- 9. Sample Data for Women's Fashion (INR)
INSERT INTO categories (name) VALUES 
('Ethnic Wear'), ('Western Wear'), ('Handbags'), ('Skincare'), ('Footwear'), ('Jewelry');

INSERT INTO deals (title, description, original_price, discount_price, category_id) VALUES 
('Embroidered Silk Saree', 'Traditional Banarasi silk with gold zari work.', 8500.00, 5999.00, 1),
('Floral Maxi Dress', 'Lightweight summer chiffon dress with belt.', 2499.00, 1299.00, 2),
('Vegan Leather Tote', 'Spacious tan brown bag for office and travel.', 3200.00, 1850.00, 3),
('18K Rose Gold Pendant', 'Minimalist heart-shaped necklace.', 15500.00, 12999.00, 6),
('Handcrafted Kolhapuris', 'Genuine leather with gold braiding.', 2999.00, 1899.00, 5);