-- Database Schema for Jewelry Store Management System
-- Run these SQL commands to create the required tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass_word VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin', 'moderator') DEFAULT 'admin',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    ad_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255),
    ad_type ENUM('banner', 'popup', 'sidebar', 'featured') NOT NULL,
    target_audience VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    reason ENUM('defective', 'wrong_item', 'not_as_described', 'damaged', 'other') NOT NULL,
    description TEXT NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    processed_amount DECIMAL(10,2),
    status ENUM('pending', 'approved', 'rejected', 'processing', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('technical', 'billing', 'product', 'shipping', 'other') NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_type ENUM('home', 'work', 'other') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    delivery_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    product_quantity INT NOT NULL DEFAULT 1,
    product_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create order_items table (if not exists)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_dates ON ads(start_date, end_date);
CREATE INDEX idx_promotions_code ON promotions(promo_code);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_user ON refunds(user_id);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(delivery_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_invoice ON orders(invoice_number);

-- Insert default super admin (password: admin123)
INSERT INTO admins (fullname, mobile, email, password, role, status) 
VALUES ('Super Admin', '1234567890', 'admin@aleenajewelry.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE admin_id = admin_id;
