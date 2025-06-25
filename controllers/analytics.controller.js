const { DB } = require("../sql")

// Get dashboard overview statistics
module.exports.getDashboardStats = (req, res) => {
    try {
        const statsQueries = [
            // Total users
            "SELECT COUNT(*) as total_users FROM users",
            // Total products
            "SELECT COUNT(*) as total_products FROM products",
            // Total orders
            "SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM orders",
            // Orders today
            "SELECT COUNT(*) as orders_today FROM orders WHERE DATE(createdAt) = CURDATE()",
            // Revenue this month
            "SELECT SUM(amount) as monthly_revenue FROM orders WHERE MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())",
            // Pending orders
            "SELECT COUNT(*) as pending_orders FROM orders WHERE delivery_status = 'pending'",
            // Low stock products
            "SELECT COUNT(*) as low_stock_products FROM products WHERE product_quantity < 10"
        ]

        Promise.all(statsQueries.map(query => {
            return new Promise((resolve, reject) => {
                DB.query(query, (err, result) => {
                    if (err) reject(err)
                    else resolve(result[0])
                })
            })
        })).then(results => {
            const dashboardStats = {
                total_users: results[0].total_users || 0,
                total_products: results[1].total_products || 0,
                total_orders: results[2].total_orders || 0,
                total_revenue: results[2].total_revenue || 0,
                orders_today: results[3].orders_today || 0,
                monthly_revenue: results[4].monthly_revenue || 0,
                pending_orders: results[5].pending_orders || 0,
                low_stock_products: results[6].low_stock_products || 0
            }
            
            res.status(200).json({ message: dashboardStats })
        }).catch(error => {
            console.log(error)
            res.status(500).json({ message: "Unable to fetch dashboard statistics" })
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get sales analytics
module.exports.getSalesAnalytics = (req, res) => {
    const { period = '7days' } = req.query
    
    let dateCondition = ""
    switch(period) {
        case '7days':
            dateCondition = "WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
            break
        case '30days':
            dateCondition = "WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
            break
        case '3months':
            dateCondition = "WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 3 MONTH)"
            break
        case '1year':
            dateCondition = "WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)"
            break
        default:
            dateCondition = "WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    }

    try {
        const salesQuery = `
            SELECT
                DATE(createdAt) as date,
                COUNT(*) as orders_count,
                SUM(amount) as daily_revenue
            FROM orders
            ${dateCondition}
            GROUP BY DATE(createdAt)
            ORDER BY date ASC
        `

        DB.query(salesQuery, (e, salesData) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch sales analytics" })
            } else {
                res.status(200).json({ message: salesData })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get product analytics
module.exports.getProductAnalytics = (req, res) => {
    try {
        const productQueries = [
            // Top selling products
            `SELECT p.product_name, p.product_id, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
             FROM products p
             JOIN order_items oi ON p.product_id = oi.product_id
             GROUP BY p.product_id
             ORDER BY total_sold DESC
             LIMIT 10`,
            
            // Products by category
            `SELECT product_category, COUNT(*) as product_count
             FROM products
             GROUP BY product_category`,
             
            // Low stock products
            `SELECT product_id, product_name, product_quantity
             FROM products
             WHERE product_quantity < 10
             ORDER BY product_quantity ASC`
        ]

        Promise.all(productQueries.map(query => {
            return new Promise((resolve, reject) => {
                DB.query(query, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })).then(results => {
            const productAnalytics = {
                top_selling_products: results[0],
                products_by_category: results[1],
                low_stock_products: results[2]
            }
            
            res.status(200).json({ message: productAnalytics })
        }).catch(error => {
            console.log(error)
            res.status(500).json({ message: "Unable to fetch product analytics" })
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get user analytics
module.exports.getUserAnalytics = (req, res) => {
    try {
        const userQueries = [
            // New users over time
            `SELECT
                DATE(createdAt) as date,
                COUNT(*) as new_users
             FROM users
             WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(createdAt)
             ORDER BY date ASC`,
             
            // Top customers by orders
            `SELECT
                u.user_id, u.fullname, u.email,
                COUNT(o.order_id) as total_orders,
                SUM(o.amount) as total_spent
             FROM users u
             JOIN orders o ON u.user_id = o.user_id
             GROUP BY u.user_id
             ORDER BY total_spent DESC
             LIMIT 10`,
             
            // User registration stats
            `SELECT
                COUNT(*) as total_users,
                COUNT(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_this_month,
                COUNT(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_this_week
             FROM users`
        ]

        Promise.all(userQueries.map(query => {
            return new Promise((resolve, reject) => {
                DB.query(query, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })).then(results => {
            const userAnalytics = {
                new_users_over_time: results[0],
                top_customers: results[1],
                user_stats: results[2][0]
            }
            
            res.status(200).json({ message: userAnalytics })
        }).catch(error => {
            console.log(error)
            res.status(500).json({ message: "Unable to fetch user analytics" })
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get order analytics
module.exports.getOrderAnalytics = (req, res) => {
    try {
        const orderQueries = [
            // Orders by status
            `SELECT delivery_status, COUNT(*) as count
             FROM orders
             GROUP BY delivery_status`,
             
            // Recent orders
            `SELECT o.order_id, o.amount, o.delivery_status, o.createdAt,
                    u.fullname as customer_name, u.email as customer_email
             FROM orders o
             JOIN users u ON o.user_id = u.user_id
             ORDER BY o.createdAt DESC
             LIMIT 10`,
             
            // Order completion rate
            `SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as completed_orders,
                ROUND((COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) / COUNT(*)) * 100, 2) as completion_rate
             FROM orders`
        ]

        Promise.all(orderQueries.map(query => {
            return new Promise((resolve, reject) => {
                DB.query(query, (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        })).then(results => {
            const orderAnalytics = {
                orders_by_status: results[0],
                recent_orders: results[1],
                completion_stats: results[2][0]
            }
            
            res.status(200).json({ message: orderAnalytics })
        }).catch(error => {
            console.log(error)
            res.status(500).json({ message: "Unable to fetch order analytics" })
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get revenue analytics
module.exports.getRevenueAnalytics = (req, res) => {
    const { period = 'monthly' } = req.query
    
    let groupBy = ""
    let dateFormat = ""
    
    switch(period) {
        case 'daily':
            groupBy = "DATE(createdAt)"
            dateFormat = "DATE(createdAt) as period"
            break
        case 'weekly':
            groupBy = "YEARWEEK(createdAt)"
            dateFormat = "YEARWEEK(createdAt) as period"
            break
        case 'monthly':
            groupBy = "YEAR(createdAt), MONTH(createdAt)"
            dateFormat = "CONCAT(YEAR(createdAt), '-', LPAD(MONTH(createdAt), 2, '0')) as period"
            break
        case 'yearly':
            groupBy = "YEAR(createdAt)"
            dateFormat = "YEAR(createdAt) as period"
            break
        default:
            groupBy = "YEAR(createdAt), MONTH(createdAt)"
            dateFormat = "CONCAT(YEAR(createdAt), '-', LPAD(MONTH(createdAt), 2, '0')) as period"
    }

    try {
        const revenueQuery = `
            SELECT
                ${dateFormat},
                COUNT(*) as orders_count,
                SUM(amount) as revenue,
                AVG(amount) as avg_order_value
            FROM orders
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY ${groupBy}
            ORDER BY period ASC
        `

        DB.query(revenueQuery, (e, revenueData) => {
            if (e) {
                console.log(e)
                res.status(500).json({ message: "Unable to fetch revenue analytics" })
            } else {
                res.status(200).json({ message: revenueData })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}
