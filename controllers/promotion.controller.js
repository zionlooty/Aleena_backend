const { DB } = require("../sql");
const { validationResult } = require("express-validator");

// Create new promotion
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
    } = req.body;

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({
                error: validationResult(req).array()
            });
        }

        // Check if promo code already exists
        DB.query("SELECT promo_code FROM promotions WHERE promo_code = ?", [promo_code], (checkErr, existing) => {
            if (checkErr) {
                console.error("Error checking promo code:", checkErr);
                return res.status(500).json({ message: "Error checking promo code" });
            }

            if (existing.length > 0) {
                return res.status(400).json({ message: "Promo code already exists" });
            }

            // Create promotion
            const query = `
                INSERT INTO promotions(
                    promo_code, title, description, discount_type, discount_value,
                    min_order_amount, max_discount_amount, usage_limit, used_count,
                    start_date, end_date, status, created_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            `;

            const values = [
                promo_code, title, description, discount_type, discount_value,
                min_order_amount || null, max_discount_amount || null, usage_limit || null, 0,
                start_date, end_date || null, status, new Date()
            ];

            DB.query(query, values, (insertErr, result) => {
                if (insertErr) {
                    console.error("Error creating promotion:", insertErr);
                    return res.status(500).json({ message: "Unable to create promotion" });
                }

                return res.status(201).json({ message: "Promotion created successfully" });
            });
        });
    } catch (error) {
        console.error("Unexpected error in createPromotion:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Get all promotions
module.exports.getAllPromotions = (req, res) => {
    try {
        const query = `
            SELECT * FROM promotions 
            ORDER BY created_at DESC
        `;

        DB.query(query, (err, promotions) => {
            if (err) {
                console.error("Error fetching promotions:", err);
                return res.status(500).json({ message: "Unable to fetch promotions" });
            }

            return res.status(200).json({ message: promotions });
        });
    } catch (error) {
        console.error("Unexpected error in getAllPromotions:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Get single promotion
module.exports.getSinglePromotion = (req, res) => {
    const { promo_id } = req.params;

    try {
        DB.query("SELECT * FROM promotions WHERE promo_id = ?", [promo_id], (err, promotion) => {
            if (err) {
                console.error("Error fetching promotion:", err);
                return res.status(500).json({ message: "Unable to fetch promotion" });
            }

            if (promotion.length === 0) {
                return res.status(404).json({ message: "Promotion not found" });
            }

            return res.status(200).json({ message: promotion[0] });
        });
    } catch (error) {
        console.error("Unexpected error in getSinglePromotion:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Update promotion
module.exports.updatePromotion = (req, res) => {
    const { promo_id } = req.params;
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
        status
    } = req.body;

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({
                error: validationResult(req).array()
            });
        }

        // Check if promotion exists
        DB.query("SELECT promo_id FROM promotions WHERE promo_id = ?", [promo_id], (checkErr, existing) => {
            if (checkErr) {
                console.error("Error checking promotion:", checkErr);
                return res.status(500).json({ message: "Error checking promotion" });
            }

            if (existing.length === 0) {
                return res.status(404).json({ message: "Promotion not found" });
            }

            // Update promotion
            const query = `
                UPDATE promotions SET
                    promo_code = ?, title = ?, description = ?, discount_type = ?, discount_value = ?,
                    min_order_amount = ?, max_discount_amount = ?, usage_limit = ?,
                    start_date = ?, end_date = ?, status = ?, updated_at = ?
                WHERE promo_id = ?
            `;

            const values = [
                promo_code, title, description, discount_type, discount_value,
                min_order_amount || null, max_discount_amount || null, usage_limit || null,
                start_date, end_date || null, status, new Date(), promo_id
            ];

            DB.query(query, values, (updateErr, result) => {
                if (updateErr) {
                    console.error("Error updating promotion:", updateErr);
                    return res.status(500).json({ message: "Unable to update promotion" });
                }

                return res.status(200).json({ message: "Promotion updated successfully" });
            });
        });
    } catch (error) {
        console.error("Unexpected error in updatePromotion:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Delete promotion
module.exports.deletePromotion = (req, res) => {
    const { promo_id } = req.params;

    try {
        // Check if promotion exists
        DB.query("SELECT promo_id FROM promotions WHERE promo_id = ?", [promo_id], (checkErr, existing) => {
            if (checkErr) {
                console.error("Error checking promotion:", checkErr);
                return res.status(500).json({ message: "Error checking promotion" });
            }

            if (existing.length === 0) {
                return res.status(404).json({ message: "Promotion not found" });
            }

            // Delete promotion
            DB.query("DELETE FROM promotions WHERE promo_id = ?", [promo_id], (deleteErr, result) => {
                if (deleteErr) {
                    console.error("Error deleting promotion:", deleteErr);
                    return res.status(500).json({ message: "Unable to delete promotion" });
                }

                return res.status(200).json({ message: "Promotion deleted successfully" });
            });
        });
    } catch (error) {
        console.error("Unexpected error in deletePromotion:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Apply promotion code
module.exports.applyPromotion = (req, res) => {
    const { promo_code, order_amount } = req.body;

    try {
        if (!promo_code || !order_amount) {
            return res.status(400).json({ message: "Promo code and order amount are required" });
        }

        // Get promotion details
        const query = `
            SELECT * FROM promotions 
            WHERE promo_code = ? AND status = 'active'
            AND start_date <= CURDATE()
            AND (end_date IS NULL OR end_date >= CURDATE())
        `;

        DB.query(query, [promo_code], (err, promotion) => {
            if (err) {
                console.error("Error fetching promotion:", err);
                return res.status(500).json({ message: "Error validating promo code" });
            }

            if (promotion.length === 0) {
                return res.status(404).json({ message: "Invalid or expired promo code" });
            }

            const promo = promotion[0];

            // Check usage limit
            if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
                return res.status(400).json({ message: "Promo code usage limit exceeded" });
            }

            // Check minimum order amount
            if (promo.min_order_amount && order_amount < promo.min_order_amount) {
                return res.status(400).json({ 
                    message: `Minimum order amount of ₦${promo.min_order_amount} required` 
                });
            }

            // Calculate discount
            let discount = 0;
            if (promo.discount_type === 'percentage') {
                discount = (order_amount * promo.discount_value) / 100;
            } else {
                discount = promo.discount_value;
            }

            // Apply maximum discount limit
            if (promo.max_discount_amount && discount > promo.max_discount_amount) {
                discount = promo.max_discount_amount;
            }

            const finalAmount = Math.max(0, order_amount - discount);

            return res.status(200).json({
                message: "Promo code applied successfully",
                promo_code: promo.promo_code,
                discount_amount: discount,
                original_amount: order_amount,
                final_amount: finalAmount,
                promo_id: promo.promo_id
            });
        });
    } catch (error) {
        console.error("Unexpected error in applyPromotion:", error);
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

// Update promotion usage count
module.exports.updatePromotionUsage = (promo_id) => {
    return new Promise((resolve, reject) => {
        DB.query(
            "UPDATE promotions SET used_count = used_count + 1 WHERE promo_id = ?",
            [promo_id],
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};
