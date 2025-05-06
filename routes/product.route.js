const express=require("express")
const { NewProduct, updateProduct, getAllProduct, deleteProduct } = require("../controllers/product.controller")
const {body, check}= require("express-validator")
const multer = require("multer")
const path = require("path")


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads/")
    },
    filename:(req, file, cb)=>{
        cb(null, `${file.originalname}-${Date.now()}${path.extname(file.originalname)}` )
    }
})

const upload = multer({storage})

const userRouter = express.Router()

userRouter.post("/new/product",
    
    [
        body("product_name").isEmpty().withMessage("product name is reqiured"),
        body("product_price").isEmpty().withMessage("product price must be in number"),
        body("product_description").optional().isString().withMessage("optional"),
        body("product_quantity").isEmpty().withMessage("must be at least 1"),
        body("discount_percentage").optional().isNumeric().withMessage("Discount must be numeric"),
        body("discount_type").optional().isIn(["black friday","promo"]).withMessage("discount type must be `black friday` or `promo`"),
        body("product_category").notEmpty().isIn(["jewelries", "clothes"]).withMessage("product category must be of one: jewelries, clothes"),
        body("product_tag").optional().isIn(["ring", "necklace", "bracelet","earing"]).withMessage("product tag must be one of:ring, necklace, bracelet, earing")
    ], upload.single("product_image") , NewProduct)


userRouter.patch("/update/product/:product_id", 
    
    [
        body("product_name").notEmpty().withMessage("product name required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_description").isEmpty().withMessage("optional"),
        body("product_quantity").notEmpty().withMessage("must be at least 1")
    ], updateProduct)


userRouter.get("/all/product", getAllProduct)


userRouter.delete("/product/:product_id", deleteProduct)

module.exports = userRouter