const express=require("express")
const { NewProduct, updateProduct, getAllProduct, deleteProduct, singleProduct, Product, getProductOptions } = require("../controllers/product.controller")
const {body, check}= require("express-validator")
const multer = require("multer")
const path = require("path")


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads/")
    },
    filename:(req, file, cb)=>{
        cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage})

const userRouter = express.Router()

userRouter.post("/new/product",

    [
    //     body("product_name").notEmpty().withMessage("product name is required"),
    //     body("product_price").isNumeric().withMessage("product price must be a number"),
    //     body("product_description").optional().isString().withMessage("description must be a string"),
    //     body("product_quantity").isNumeric().withMessage("quantity must be at least 1"),
    //     body("discount_percentage").optional().isNumeric().withMessage("Discount must be numeric"),
    //     body("discount_type").optional().isIn([
    //         "none", "promo", "seasonal", "clearance", "black-friday", "cyber-monday",
    //         "new-year", "valentine", "mother-day", "father-day", "christmas", "easter",
    //         "summer", "winter", "spring", "fall", "bulk", "loyalty", "first-time",
    //         "student", "senior", "military", "employee", "flash-sale", "weekend",
    //         "birthday", "anniversary", "grand-opening", "liquidation", "end-of-season"
    //     ]).withMessage("Invalid discount type"),
    //     body("product_category").isIn([
    //         "rings", "necklaces", "earrings", "bracelets", "watches", "chains", "pendants",
    //         "anklets", "brooches", "cufflinks", "sets", "bangles", "chokers", "tiaras",
    //         "body-jewelry", "hair-accessories", "gemstones", "pearls", "gold", "silver",
    //         "platinum", "diamond", "custom", "vintage", "luxury"
    //     ]).withMessage("Invalid product category"),
    //     body("product_tag").optional().isIn([
    //         "new-arrival", "best-seller", "limited-edition", "sale", "premium", "handcrafted",
    //         "trending", "exclusive", "vintage", "modern", "featured", "popular", "recommended",
    //         "hot-deal", "clearance", "gift-idea", "bridal", "anniversary", "birthday",
    //         "valentine", "mother-day", "father-day", "christmas", "graduation", "engagement",
    //         "wedding", "everyday", "formal", "casual", "office"
    //     ]).withMessage("Invalid product tag")
    ], upload.single("product_image") , NewProduct)


userRouter.patch("/update/product/:product_id", 
    
    [
        body("product_name").notEmpty().withMessage("product name required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_description").optional().notEmpty().withMessage("Description cannot be empty if provided"),
        body("product_quantity").notEmpty().withMessage("must be at least 1")
    ], updateProduct)


userRouter.get("/products", getAllProduct)

// Alternative endpoint for dashboard compatibility
userRouter.get("/all/product", getAllProduct)

userRouter.get("/product/:product_id", singleProduct)



userRouter.delete("/product/:product_id", deleteProduct)

userRouter.get("/product_category/:product_category", Product)

// Get product options (categories, tags, discount types)
userRouter.get("/product/options", getProductOptions)

module.exports = userRouter