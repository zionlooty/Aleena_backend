const express = require("express");
const {
    createPromotion,
    getAllPromotions,
    getSinglePromotion,
    updatePromotion,
    deletePromotion,
    applyPromotion
} = require("../controllers/promotion.controller");
const { body } = require("express-validator");
const { verifyUser } = require("../middlewares/auth");

const promotionRouter = express.Router();

// Create new promotion
promotionRouter.post("/promotions/create",
    verifyUser,
    [
        body("promo_code").notEmpty().withMessage("Promo code is required"),
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("discount_type").isIn(['percentage', 'fixed']).withMessage("Discount type must be 'percentage' or 'fixed'"),
        body("discount_value").isNumeric().withMessage("Discount value must be a number"),
        body("start_date").isISO8601().withMessage("Valid start date is required"),
        body("end_date").optional().isISO8601().withMessage("End date must be a valid date"),
        body("min_order_amount").optional().isNumeric().withMessage("Minimum order amount must be a number"),
        body("max_discount_amount").optional().isNumeric().withMessage("Maximum discount amount must be a number"),
        body("usage_limit").optional().isInt({ min: 1 }).withMessage("Usage limit must be a positive integer"),
        body("status").optional().isIn(['active', 'inactive', 'draft']).withMessage("Status must be 'active', 'inactive', or 'draft'")
    ],
    createPromotion
);

// Get all promotions
promotionRouter.get("/promotions/all", verifyUser, getAllPromotions);

// Get single promotion
promotionRouter.get("/promotions/:promo_id", verifyUser, getSinglePromotion);

// Update promotion
promotionRouter.patch("/promotions/:promo_id",
    verifyUser,
    [
        body("promo_code").notEmpty().withMessage("Promo code is required"),
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("discount_type").isIn(['percentage', 'fixed']).withMessage("Discount type must be 'percentage' or 'fixed'"),
        body("discount_value").isNumeric().withMessage("Discount value must be a number"),
        body("start_date").isISO8601().withMessage("Valid start date is required"),
        body("end_date").optional().isISO8601().withMessage("End date must be a valid date"),
        body("min_order_amount").optional().isNumeric().withMessage("Minimum order amount must be a number"),
        body("max_discount_amount").optional().isNumeric().withMessage("Maximum discount amount must be a number"),
        body("usage_limit").optional().isInt({ min: 1 }).withMessage("Usage limit must be a positive integer"),
        body("status").optional().isIn(['active', 'inactive', 'draft']).withMessage("Status must be 'active', 'inactive', or 'draft'")
    ],
    updatePromotion
);

// Delete promotion
promotionRouter.delete("/promotions/:promo_id", verifyUser, deletePromotion);

// Apply promotion code (public endpoint for checkout)
promotionRouter.post("/promotions/apply",
    [
        body("promo_code").notEmpty().withMessage("Promo code is required"),
        body("order_amount").isNumeric().withMessage("Order amount must be a number")
    ],
    applyPromotion
);

module.exports = promotionRouter;
