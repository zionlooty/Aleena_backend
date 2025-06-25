const { DB } = require("./sql");

console.log("🚀 Setting up dashboard database tables...");

// Create admins table
const createAdminsTable = () => {
    return new Promise((resolve, reject) => {
        const query = `
            CREATE TABLE IF NOT EXISTS admins (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'super_admin', 'moderator') DEFAULT 'admin',
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        DB.query(query, (err, result) => {
            if (err) {
                console.error("❌ Error creating admins table:", err);
                reject(err);
            } else {
                console.log("✅ Admins table created/verified");
                resolve(result);
            }
        });
    });
};

// Create promotions table
const createPromotionsTable = () => {
    return new Promise((resolve, reject) => {
        const query = `
            CREATE TABLE IF NOT EXISTS promotions (
                promo_id INT AUTO_INCREMENT PRIMARY KEY,
                promo_code VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                discount_type ENUM('percentage', 'fixed') NOT NULL,
                discount_value DECIMAL(10,2) NOT NULL,
                min_order_amount DECIMAL(10,2) NULL,
                max_discount_amount DECIMAL(10,2) NULL,
                usage_limit INT NULL,
                used_count INT DEFAULT 0,
                start_date DATE NOT NULL,
                end_date DATE NULL,
                status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        DB.query(query, (err, result) => {
            if (err) {
                console.error("❌ Error creating promotions table:", err);
                reject(err);
            } else {
                console.log("✅ Promotions table created/verified");
                resolve(result);
            }
        });
    });
};

// Create ads table
const createAdsTable = () => {
    return new Promise((resolve, reject) => {
        const query = `
            CREATE TABLE IF NOT EXISTS ads (
                ad_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                ad_type ENUM('banner', 'popup', 'sidebar', 'footer') DEFAULT 'banner',
                target_audience VARCHAR(255),
                start_date DATE NOT NULL,
                end_date DATE NULL,
                status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        DB.query(query, (err, result) => {
            if (err) {
                console.error("❌ Error creating ads table:", err);
                reject(err);
            } else {
                console.log("✅ Ads table created/verified");
                resolve(result);
            }
        });
    });
};

// Add missing columns to existing tables
const updateExistingTables = () => {
    return new Promise((resolve, reject) => {
        // Add status column to users table if it doesn't exist
        const addUserStatusQuery = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'blocked') DEFAULT 'active'
        `;
        
        DB.query(addUserStatusQuery, (err1, result1) => {
            if (err1 && !err1.message.includes('Duplicate column name')) {
                console.error("❌ Error adding status to users table:", err1);
            } else {
                console.log("✅ Users table status column verified");
            }
            
            // Add admin_notes and updated_at columns to orders table if they don't exist
            const addOrderColumnsQuery = `
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS admin_notes TEXT,
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `;
            
            DB.query(addOrderColumnsQuery, (err2, result2) => {
                if (err2 && !err2.message.includes('Duplicate column name')) {
                    console.error("❌ Error adding columns to orders table:", err2);
                } else {
                    console.log("✅ Orders table columns verified");
                }
                resolve();
            });
        });
    });
};

// Create refunds table
const createRefundsTable = () => {
    return new Promise((resolve, reject) => {
        const query = `
            CREATE TABLE IF NOT EXISTS refunds (
                refund_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                user_id INT NOT NULL,
                reason TEXT NOT NULL,
                refund_amount DECIMAL(10,2) NOT NULL,
                processed_amount DECIMAL(10,2) NULL,
                status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `;
        
        DB.query(query, (err, result) => {
            if (err) {
                console.error("❌ Error creating refunds table:", err);
                reject(err);
            } else {
                console.log("✅ Refunds table created/verified");
                resolve(result);
            }
        });
    });
};

// Main setup function
const setupTables = async () => {
    try {
        await createAdminsTable();
        await createPromotionsTable();
        await createAdsTable();
        await createRefundsTable();
        await updateExistingTables();
        
        console.log("\n🎉 All dashboard tables setup completed successfully!");
        console.log("\n📋 Tables created/verified:");
        console.log("   ✅ admins");
        console.log("   ✅ promotions");
        console.log("   ✅ ads");
        console.log("   ✅ refunds");
        console.log("   ✅ users (updated)");
        console.log("   ✅ orders (updated)");
        
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Setup failed:", error);
        process.exit(1);
    }
};

// Run setup
setupTables();
