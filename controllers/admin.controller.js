const { DB } = require("../sql")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Create admin user
module.exports.createAdmin = (req, res) => {
    console.log("🔧 Creating admin with data:", req.body)

    const { fullname, mobile, email, password, role = 'admin', status = 'active' } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            console.error("❌ Validation errors:", errorResponse.errors)
            return res.status(400).json({
                message: errorResponse.errors[0].msg
            })
        }

        DB.query("SELECT * FROM admins WHERE email = ? OR mobile = ?", [email, mobile], (e, admin) => {
            if (e) {
                console.error("❌ Database error checking existing admin:", e)
                return res.status(500).json({ message: "Error checking existing admin" })
            }

            if (admin.length > 0) {
                console.log("⚠️ Admin already exists with email or mobile")
                return res.status(400).json({ message: "Mobile number or email already exists" })
            }

            const encryptedPassword = bcrypt.hashSync(password, 10)
            console.log("🔐 Password encrypted, inserting admin...")

            DB.query("INSERT INTO admins(fullname, mobile, email, password, role, status, created_at) VALUES(?,?,?,?,?,?,?)",
            [fullname, mobile, email, encryptedPassword, role, status, new Date()], (er, result) => {
                if (er) {
                    console.error("❌ Error inserting admin:", er)
                    return res.status(500).json({ message: "Unable to create admin" })
                }

                console.log("✅ Admin created successfully with ID:", result.insertId)
                return res.status(201).json({
                    message: "Admin created successfully",
                    admin_id: result.insertId
                })
            })
        })
    } catch (error) {
        console.error("❌ Unexpected error in createAdmin:", error)
        return res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Admin login
module.exports.loginAdmin = (req, res) => {
    const { email_number, password } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                message: errorResponse.errors[0].msg
            })
        } else {
            DB.query("SELECT * FROM admins WHERE email = ? OR mobile = ? AND status = 'active'", [email_number, email_number], (e, admin) => {
                if (e) {
                    res.status(500).json({ message: "Unable to get admin" })
                } else {
                    if (admin.length > 0) {
                        const db_password = admin[0].password
                        const match = bcrypt.compareSync(password, db_password)
                        if (match) {
                            const token = jwt.sign({ 
                                id: admin[0].admin_id, 
                                role: admin[0].role,
                                type: 'admin'
                            }, process.env.JWT_SECRET, { expiresIn: "1d" })
                            res.status(200).json({ 
                                message: "Login successful",
                                token: token,
                                admin: {
                                    id: admin[0].admin_id,
                                    fullname: admin[0].fullname,
                                    email: admin[0].email,
                                    role: admin[0].role
                                }
                            })
                        } else {
                            res.status(400).json({ message: "Email or Password incorrect" })
                        }
                    } else {
                        res.status(404).json({ message: "Admin not found or inactive" })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get all admins
module.exports.getAllAdmins = (req, res) => {
    try {
        DB.query("SELECT admin_id, fullname, mobile, email, role, status, created_at FROM admins ORDER BY created_at DESC", (err, admins) => {
            if (err) {
                return res.status(500).json({ message: "Unable to fetch admins" });
            }

            if (admins.length > 0) {
                return res.status(200).json({ message: admins });
            } else {
                return res.status(404).json({ message: "No admins found" });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message ?? "Something went wrong" });
    }
};

// Get single admin
module.exports.getAdmin = (req, res) => {
    const { admin_id } = req.params

    try {
        DB.query("SELECT admin_id, fullname, mobile, email, role, status, created_at FROM admins WHERE admin_id = ?", [admin_id], (e, admin) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch admin" })
            } else {
                if (admin.length > 0) {
                    res.status(200).json({ message: admin[0] })
                } else {
                    res.status(404).json({ message: "Admin not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Update admin
module.exports.updateAdmin = (req, res) => {
    const { admin_id } = req.params
    const { fullname, mobile, email, role, status } = req.body
    const errorResponse = validationResult(req)
    
    try {
        if (!errorResponse.isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        } else {
            DB.query('UPDATE admins SET fullname = ?, mobile = ?, email = ?, role = ?, status = ? WHERE admin_id = ?', 
            [fullname, mobile, email, role, status, admin_id], (e, result) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "Can't update admin" })
                } else {
                    if (result.affectedRows === 0) {
                        res.status(404).json({ message: "Admin not found" })
                    } else {
                        res.status(200).json({ message: "Admin updated successfully" })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Delete admin
module.exports.deleteAdmin = (req, res) => {
    const { admin_id } = req.params

    try {
        if (!admin_id) {
            return res.status(400).json({ message: "Admin ID is required" })
        }

        DB.query("SELECT * FROM admins WHERE admin_id = ?", [admin_id], (er, admins) => {
            if (er) {
                return res.status(500).json({ message: "Error checking admin" })
            } else {
                if (admins.length === 0) {
                    return res.status(404).json({ message: "Admin not found" })
                }
            }

            DB.query("DELETE FROM admins WHERE admin_id = ?", [admin_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete admin" })
                }
                res.status(200).json({ message: "Admin deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Change admin password
module.exports.changeAdminPassword = (req, res) => {
    const { admin_id } = req.params
    const { current_password, new_password } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!errorResponse.isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        DB.query("SELECT * FROM admins WHERE admin_id = ?", [admin_id], (e, admin) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch admin" })
            } else {
                if (admin.length > 0) {
                    const match = bcrypt.compareSync(current_password, admin[0].password)
                    if (match) {
                        const encryptedPassword = bcrypt.hashSync(new_password, 10)
                        DB.query("UPDATE admins SET password = ? WHERE admin_id = ?", [encryptedPassword, admin_id], (er, _) => {
                            if (er) {
                                res.status(500).json({ message: "Unable to update password" })
                            } else {
                                res.status(200).json({ message: "Password updated successfully" })
                            }
                        })
                    } else {
                        res.status(400).json({ message: "Current password is incorrect" })
                    }
                } else {
                    res.status(404).json({ message: "Admin not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get current admin profile
module.exports.getCurrentAdmin = (req, res) => {
    const { id } = req.user

    try {
        DB.query("SELECT admin_id, fullname, mobile, email, role, status, created_at FROM admins WHERE admin_id = ?", [id], (e, admin) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch admin" })
            } else {
                if (admin.length > 0) {
                    res.status(200).json({ message: admin[0] })
                } else {
                    res.status(404).json({ message: "Admin not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get dashboard statistics
module.exports.getDashboardStats = (req, res) => {
    try {
        const stats = {};
        let completedQueries = 0;
        const totalQueries = 5;

        const checkComplete = () => {
            completedQueries++;
            if (completedQueries === totalQueries) {
                return res.status(200).json({ message: stats });
            }
        };

        // Get total users
        DB.query("SELECT COUNT(*) as total FROM users", (err, result) => {
            if (!err && result.length > 0) {
                stats.totalUsers = result[0].total;
            } else {
                stats.totalUsers = 0;
            }
            checkComplete();
        });

        // Get total products
        DB.query("SELECT COUNT(*) as total FROM products", (err, result) => {
            if (!err && result.length > 0) {
                stats.totalProducts = result[0].total;
            } else {
                stats.totalProducts = 0;
            }
            checkComplete();
        });

        // Get total orders
        DB.query("SELECT COUNT(*) as total FROM orders", (err, result) => {
            if (!err && result.length > 0) {
                stats.totalOrders = result[0].total;
            } else {
                stats.totalOrders = 0;
            }
            checkComplete();
        });

        // Get pending orders
        DB.query("SELECT COUNT(*) as total FROM orders WHERE delivery_status = 'pending'", (err, result) => {
            if (!err && result.length > 0) {
                stats.pendingOrders = result[0].total;
            } else {
                stats.pendingOrders = 0;
            }
            checkComplete();
        });

        // Get total revenue
        DB.query("SELECT SUM(amount) as total FROM orders WHERE payment_status = 'paid'", (err, result) => {
            if (!err && result.length > 0 && result[0].total) {
                stats.totalRevenue = parseFloat(result[0].total);
            } else {
                stats.totalRevenue = 0;
            }
            checkComplete();
        });

    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        return res.status(500).json({ message: "Unable to fetch dashboard statistics" });
    }
};
