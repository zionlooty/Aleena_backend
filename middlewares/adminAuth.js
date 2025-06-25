const jwt = require("jsonwebtoken")
require("dotenv").config()

// Verify admin token
module.exports.verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization
    const authToken = token ? token.split(" ")[1] : null
    
    try {
        if (authToken) {
            const verifyToken = jwt.verify(authToken, process.env.JWT_SECRET)
            if (verifyToken && verifyToken.type === 'admin') {
                req.user = { 
                    id: verifyToken.id, 
                    role: verifyToken.role,
                    type: verifyToken.type 
                }
                next()
            } else {
                res.status(403).json({ message: "Admin access required" })
            }
        } else {
            res.status(401).json({ message: "No token provided" })
        }
    } catch (error) {
        res.status(500).json({ message: "Invalid token or please login as admin" })
    }
}

// Verify super admin
module.exports.verifySuperAdmin = (req, res, next) => {
    const token = req.headers.authorization
    const authToken = token ? token.split(" ")[1] : null
    
    try {
        if (authToken) {
            const verifyToken = jwt.verify(authToken, process.env.JWT_SECRET)
            if (verifyToken && verifyToken.type === 'admin' && verifyToken.role === 'super_admin') {
                req.user = { 
                    id: verifyToken.id, 
                    role: verifyToken.role,
                    type: verifyToken.type 
                }
                next()
            } else {
                res.status(403).json({ message: "Super admin access required" })
            }
        } else {
            res.status(401).json({ message: "No token provided" })
        }
    } catch (error) {
        res.status(500).json({ message: "Invalid token or please login as super admin" })
    }
}

// Verify user or admin
module.exports.verifyUserOrAdmin = (req, res, next) => {
    const token = req.headers.authorization
    const authToken = token ? token.split(" ")[1] : null
    
    try {
        if (authToken) {
            const verifyToken = jwt.verify(authToken, process.env.JWT_SECRET)
            if (verifyToken) {
                req.user = { 
                    id: verifyToken.id, 
                    role: verifyToken.role || 'user',
                    type: verifyToken.type || 'user'
                }
                next()
            } else {
                res.status(403).json({ message: "Token expired" })
            }
        } else {
            res.status(401).json({ message: "No token provided" })
        }
    } catch (error) {
        res.status(500).json({ message: "Invalid token or please login" })
    }
}
