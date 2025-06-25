const express = require("express")
const { 
    createAd, 
    getAllAds, 
    getSingleAd, 
    updateAd, 
    deleteAd, 
    getActiveAds,
    createPromotion,
    getAllPromotions,
    validatePromoCode
} = require("../controllers/ads.controller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")
const multer = require("multer")
const path = require("path")

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        
        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

const adsRouter = express.Router()

// Advertisement routes
// Create new advertisement
adsRouter.post("/ads/create",
    verifyUser,
    upload.single('image'),
    [
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("ad_type").isIn(['banner', 'popup', 'sidebar', 'featured']).withMessage("Invalid ad type"),
        body("target_audience").optional().notEmpty().withMessage("Target audience cannot be empty"),
        body("start_date").isISO8601().withMessage("Invalid start date"),
        body("end_date").optional().isISO8601().withMessage("Invalid end date"),
        body("status").optional().isIn(['active', 'inactive', 'draft']).withMessage("Invalid status")
    ],
    createAd)

// Get all advertisements
adsRouter.get("/ads/all", verifyUser, getAllAds)

// Get active advertisements (public)
adsRouter.get("/ads/active", getActiveAds)

// Get single advertisement
adsRouter.get("/ads/:ad_id", getSingleAd)

// Update advertisement
adsRouter.patch("/ads/:ad_id",
    verifyUser,
    upload.single('image'),
    [
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("ad_type").isIn(['banner', 'popup', 'sidebar', 'featured']).withMessage("Invalid ad type"),
        body("target_audience").optional().notEmpty().withMessage("Target audience cannot be empty"),
        body("start_date").isISO8601().withMessage("Invalid start date"),
        body("end_date").optional().isISO8601().withMessage("Invalid end date"),
        body("status").optional().isIn(['active', 'inactive', 'draft']).withMessage("Invalid status")
    ],
    updateAd)

// Delete advertisement
adsRouter.delete("/ads/:ad_id", verifyUser, deleteAd)

// Promotion routes
// Create new promotion
adsRouter.post("/promotions/create",
    verifyUser,
    [
        body("promo_code").notEmpty().withMessage("Promo code is required"),
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("discount_type").isIn(['percentage', 'fixed']).withMessage("Invalid discount type"),
        body("discount_value").isNumeric().withMessage("Discount value must be numeric"),
        body("min_order_amount").optional().isNumeric().withMessage("Minimum order amount must be numeric"),
        body("max_discount_amount").optional().isNumeric().withMessage("Maximum discount amount must be numeric"),
        body("usage_limit").optional().isInt({min: 1}).withMessage("Usage limit must be a positive integer"),
        body("start_date").isISO8601().withMessage("Invalid start date"),
        body("end_date").optional().isISO8601().withMessage("Invalid end date"),
        body("status").optional().isIn(['active', 'inactive', 'draft']).withMessage("Invalid status")
    ],
    createPromotion)

// Get all promotions
adsRouter.get("/promotions/all", verifyUser, getAllPromotions)

// Validate promo code
adsRouter.post("/promotions/validate",
    [
        body("promo_code").notEmpty().withMessage("Promo code is required"),
        body("order_amount").isNumeric().withMessage("Order amount must be numeric")
    ],
    validatePromoCode)

module.exports = adsRouter
