const { DB } = require("../sql")
const { validationResult } = require("express-validator")

// Create new advertisement
module.exports.createAd = (req, res) => {
    const { title, description, ad_type, target_audience, start_date, end_date, status = 'active' } = req.body
    const fileUrl = req.file ? req.file.filename : null
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            DB.query("INSERT INTO ads(title, description, image, ad_type, target_audience, start_date, end_date, status, created_at) VALUES(?,?,?,?,?,?,?,?,?)", 
            [title, description, fileUrl, ad_type, target_audience, start_date, end_date, status, new Date()], (e, result) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "Unable to create advertisement" })
                } else {
                    res.status(201).json({ message: "Advertisement created successfully", ad_id: result.insertId })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get all advertisements
module.exports.getAllAds = (req, res) => {
    const { status, ad_type } = req.query
    let query = "SELECT * FROM ads"
    let queryParams = []

    if (status || ad_type) {
        query += " WHERE"
        const conditions = []
        
        if (status) {
            conditions.push(" status = ?")
            queryParams.push(status)
        }
        
        if (ad_type) {
            conditions.push(" ad_type = ?")
            queryParams.push(ad_type)
        }
        
        query += conditions.join(" AND")
    }
    
    query += " ORDER BY created_at DESC"

    try {
        DB.query(query, queryParams, (e, ads) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch advertisements" })
            } else {
                if (ads.length > 0) {
                    res.status(200).json({ message: ads })
                } else {
                    res.status(404).json({ message: "No advertisements found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get single advertisement
module.exports.getSingleAd = (req, res) => {
    const { ad_id } = req.params

    try {
        if (!ad_id) {
            return res.status(400).json({ message: "Advertisement ID is required" })
        }

        DB.query("SELECT * FROM ads WHERE ad_id = ?", [ad_id], (e, ad) => {
            if (e) {
                res.status(500).json({ message: "Error fetching advertisement" })
            } else {
                if (ad.length > 0) {
                    res.status(200).json({ message: ad[0] })
                } else {
                    res.status(404).json({ message: "Advertisement not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update advertisement
module.exports.updateAd = (req, res) => {
    const { ad_id } = req.params
    const { title, description, ad_type, target_audience, start_date, end_date, status } = req.body
    const fileUrl = req.file ? req.file.filename : null
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        let query = "UPDATE ads SET title = ?, description = ?, ad_type = ?, target_audience = ?, start_date = ?, end_date = ?, status = ?"
        let queryParams = [title, description, ad_type, target_audience, start_date, end_date, status]

        if (fileUrl) {
            query += ", image = ?"
            queryParams.push(fileUrl)
        }

        query += " WHERE ad_id = ?"
        queryParams.push(ad_id)

        DB.query(query, queryParams, (err, result) => {
            if (err) {
                res.status(500).json({ message: "Unable to update advertisement" })
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ message: "Advertisement not found" })
                } else {
                    res.status(200).json({ message: "Advertisement updated successfully" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Delete advertisement
module.exports.deleteAd = (req, res) => {
    const { ad_id } = req.params

    try {
        if (!ad_id) {
            return res.status(400).json({ message: "Advertisement ID is required" })
        }

        DB.query("SELECT * FROM ads WHERE ad_id = ?", [ad_id], (er, ads) => {
            if (er) {
                return res.status(500).json({ message: "Error checking advertisement" })
            } else {
                if (ads.length === 0) {
                    return res.status(404).json({ message: "Advertisement not found" })
                }
            }

            DB.query("DELETE FROM ads WHERE ad_id = ?", [ad_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete advertisement" })
                }
                res.status(200).json({ message: "Advertisement deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get active advertisements for public display
module.exports.getActiveAds = (req, res) => {
    const { ad_type } = req.query
    let query = "SELECT ad_id, title, description, image, ad_type, target_audience, start_date, end_date FROM ads WHERE status = 'active' AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW())"
    let queryParams = []

    if (ad_type) {
        query += " AND ad_type = ?"
        queryParams.push(ad_type)
    }

    query += " ORDER BY created_at DESC"

    try {
        DB.query(query, queryParams, (e, ads) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch active advertisements" })
            } else {
                res.status(200).json({ message: ads })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Create promotion/discount
module.exports.createPromotion = (req, res) => {
    const { 
        promo_code, 
        title, 
        description, 
        discount_type, 
        discount_value, 
        min_order_amount, 
        max_discount_amount,
        usage_limit,
        start_date, 
        end_date, 
        status = 'active' 
    } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            // Check if promo code already exists
            DB.query("SELECT * FROM promotions WHERE promo_code = ?", [promo_code], (er, existing) => {
                if (er) {
                    res.status(500).json({ message: "Error checking promo code" })
                } else {
                    if (existing.length > 0) {
                        res.status(400).json({ message: "Promo code already exists" })
                    } else {
                        DB.query("INSERT INTO promotions(promo_code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, start_date, end_date, status, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", 
                        [promo_code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, 0, start_date, end_date, status, new Date()], (e, result) => {
                            if (e) {
                                console.log(e)
                                res.status(500).json({ message: "Unable to create promotion" })
                            } else {
                                res.status(201).json({ message: "Promotion created successfully", promo_id: result.insertId })
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

// Get all promotions
module.exports.getAllPromotions = (req, res) => {
    const { status } = req.query
    let query = "SELECT * FROM promotions"
    let queryParams = []

    if (status) {
        query += " WHERE status = ?"
        queryParams.push(status)
    }
    
    query += " ORDER BY created_at DESC"

    try {
        DB.query(query, queryParams, (e, promotions) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch promotions" })
            } else {
                res.status(200).json({ message: promotions })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Validate and apply promo code
module.exports.validatePromoCode = (req, res) => {
    const { promo_code, order_amount } = req.body

    try {
        DB.query("SELECT * FROM promotions WHERE promo_code = ? AND status = 'active' AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW())", [promo_code], (e, promo) => {
            if (e) {
                res.status(500).json({ message: "Error validating promo code" })
            } else {
                if (promo.length > 0) {
                    const promotion = promo[0]
                    
                    // Check usage limit
                    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
                        return res.status(400).json({ message: "Promo code usage limit exceeded" })
                    }
                    
                    // Check minimum order amount
                    if (promotion.min_order_amount && order_amount < promotion.min_order_amount) {
                        return res.status(400).json({ message: `Minimum order amount is ${promotion.min_order_amount}` })
                    }
                    
                    // Calculate discount
                    let discount_amount = 0
                    if (promotion.discount_type === 'percentage') {
                        discount_amount = (order_amount * promotion.discount_value) / 100
                        if (promotion.max_discount_amount && discount_amount > promotion.max_discount_amount) {
                            discount_amount = promotion.max_discount_amount
                        }
                    } else {
                        discount_amount = promotion.discount_value
                    }
                    
                    res.status(200).json({ 
                        message: "Promo code is valid",
                        promotion: {
                            promo_id: promotion.promo_id,
                            promo_code: promotion.promo_code,
                            title: promotion.title,
                            discount_type: promotion.discount_type,
                            discount_value: promotion.discount_value,
                            discount_amount: discount_amount
                        }
                    })
                } else {
                    res.status(404).json({ message: "Invalid or expired promo code" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}
