const { DB } = require("../sql")
const { validationResult } = require("express-validator")

// Create refund request
module.exports.createRefundRequest = (req, res) => {
    const { order_id, reason, description, refund_amount } = req.body
    const { id: user_id } = req.user
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            // First check if order exists and belongs to user
            DB.query("SELECT * FROM orders WHERE order_id = ? AND user_id = ?", [order_id, user_id], (er, order) => {
                if (er) {
                    res.status(500).json({ message: "Error checking order" })
                } else {
                    if (order.length === 0) {
                        res.status(404).json({ message: "Order not found or doesn't belong to you" })
                    } else {
                        // Check if refund request already exists for this order
                        DB.query("SELECT * FROM refunds WHERE order_id = ?", [order_id], (err, existing) => {
                            if (err) {
                                res.status(500).json({ message: "Error checking existing refund" })
                            } else {
                                if (existing.length > 0) {
                                    res.status(400).json({ message: "Refund request already exists for this order" })
                                } else {
                                    DB.query("INSERT INTO refunds(order_id, user_id, reason, description, refund_amount, status, created_at) VALUES(?,?,?,?,?,?,?)", 
                                    [order_id, user_id, reason, description, refund_amount, 'pending', new Date()], (e, result) => {
                                        if (e) {
                                            console.log(e)
                                            res.status(500).json({ message: "Unable to create refund request" })
                                        } else {
                                            res.status(201).json({ message: "Refund request created successfully", refund_id: result.insertId })
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get all refund requests (admin)
module.exports.getAllRefunds = (req, res) => {
    const { status, user_id } = req.query
    let query = `
        SELECT r.*, o.amount as order_amount, u.fullname as customer_name, u.email as customer_email,
               o.product_name, o.quantity, o.delivery_address
        FROM refunds r
        JOIN orders o ON r.order_id = o.order_id
        JOIN users u ON r.user_id = u.user_id
    `
    let queryParams = []

    if (status || user_id) {
        query += " WHERE"
        const conditions = []
        
        if (status) {
            conditions.push(" r.status = ?")
            queryParams.push(status)
        }
        
        if (user_id) {
            conditions.push(" r.user_id = ?")
            queryParams.push(user_id)
        }
        
        query += conditions.join(" AND")
    }
    
    query += " ORDER BY r.created_at DESC"

    try {
        DB.query(query, queryParams, (e, refunds) => {
            if (e) {
                console.log(e)
                res.status(500).json({ message: "Unable to fetch refunds" })
            } else {
                res.status(200).json({ message: refunds })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get user's refund requests
module.exports.getUserRefunds = (req, res) => {
    const { id: user_id } = req.user

    try {
        const query = `
            SELECT r.*, o.total_amount as order_amount, p.product_name, p.product_price
            FROM refunds r
            JOIN orders o ON r.order_id = o.order_id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `

        DB.query(query, [user_id], (e, refunds) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch your refunds" })
            } else {
                res.status(200).json({ message: refunds })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get single refund request
module.exports.getSingleRefund = (req, res) => {
    const { refund_id } = req.params

    try {
        if (!refund_id) {
            return res.status(400).json({ message: "Refund ID is required" })
        }

        const query = `
            SELECT r.*, o.total_amount as order_amount, u.fullname as customer_name, u.email as customer_email,
                   u.mobile as customer_mobile, p.product_name, p.product_price
            FROM refunds r
            JOIN orders o ON r.order_id = o.order_id
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE r.refund_id = ?
        `

        DB.query(query, [refund_id], (e, refund) => {
            if (e) {
                res.status(500).json({ message: "Error fetching refund" })
            } else {
                if (refund.length > 0) {
                    res.status(200).json({ message: refund[0] })
                } else {
                    res.status(404).json({ message: "Refund not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update refund status (admin)
module.exports.updateRefundStatus = (req, res) => {
    const { refund_id } = req.params
    const { status, admin_notes, processed_amount } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        let query = "UPDATE refunds SET status = ?, admin_notes = ?, updated_at = ?"
        let queryParams = [status, admin_notes, new Date()]

        if (status === 'approved' && processed_amount) {
            query += ", processed_amount = ?, processed_at = ?"
            queryParams.push(processed_amount, new Date())
        }

        query += " WHERE refund_id = ?"
        queryParams.push(refund_id)

        DB.query(query, queryParams, (err, result) => {
            if (err) {
                res.status(500).json({ message: "Unable to update refund status" })
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ message: "Refund not found" })
                } else {
                    res.status(200).json({ message: "Refund status updated successfully" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Delete refund request
module.exports.deleteRefund = (req, res) => {
    const { refund_id } = req.params

    try {
        if (!refund_id) {
            return res.status(400).json({ message: "Refund ID is required" })
        }

        DB.query("SELECT * FROM refunds WHERE refund_id = ?", [refund_id], (er, refunds) => {
            if (er) {
                return res.status(500).json({ message: "Error checking refund" })
            } else {
                if (refunds.length === 0) {
                    return res.status(404).json({ message: "Refund not found" })
                }
            }

            DB.query("DELETE FROM refunds WHERE refund_id = ?", [refund_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete refund" })
                }
                res.status(200).json({ message: "Refund deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get refund statistics (admin)
module.exports.getRefundStats = (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_refunds,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_refunds,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_refunds,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_refunds,
                SUM(CASE WHEN status = 'approved' THEN processed_amount ELSE 0 END) as total_refunded_amount,
                AVG(CASE WHEN status = 'approved' THEN processed_amount ELSE 0 END) as avg_refund_amount
            FROM refunds
        `

        DB.query(statsQuery, (e, stats) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch refund statistics" })
            } else {
                res.status(200).json({ message: stats[0] })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Cancel refund request (user)
module.exports.cancelRefundRequest = (req, res) => {
    const { refund_id } = req.params
    const { id: user_id } = req.user

    try {
        // Check if refund belongs to user and is still pending
        DB.query("SELECT * FROM refunds WHERE refund_id = ? AND user_id = ? AND status = 'pending'", [refund_id, user_id], (er, refund) => {
            if (er) {
                res.status(500).json({ message: "Error checking refund" })
            } else {
                if (refund.length === 0) {
                    res.status(404).json({ message: "Refund not found or cannot be cancelled" })
                } else {
                    DB.query("UPDATE refunds SET status = 'cancelled', updated_at = ? WHERE refund_id = ?", [new Date(), refund_id], (e, _) => {
                        if (e) {
                            res.status(500).json({ message: "Unable to cancel refund request" })
                        } else {
                            res.status(200).json({ message: "Refund request cancelled successfully" })
                        }
                    })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}
