-- SQL script to update the orders table with missing columns
-- Run this script if the orders table already exists but is missing columns

-- Add missing columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add unique constraint to invoice_number if it doesn't exist
ALTER TABLE orders 
ADD CONSTRAINT UNIQUE KEY unique_invoice_number (invoice_number);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_number);

-- Update existing orders with default values if needed
UPDATE orders 
SET 
    total_amount = 0 
WHERE total_amount IS NULL;

UPDATE orders 
SET 
    payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Generate invoice numbers for existing orders that don't have them
UPDATE orders 
SET 
    invoice_number = CONCAT('INV-', UNIX_TIMESTAMP(created_at), '-', LPAD(order_id, 3, '0'))
WHERE invoice_number IS NULL;
