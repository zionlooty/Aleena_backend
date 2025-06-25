const express = require("express")
const { 
    addAddress,
    getUserAddresses,
    getSingleAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressesByType
} = require("../controllers/address.controller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const addressRouter = express.Router()

// Add new address
addressRouter.post("/addresses/add",
    verifyUser,
    [
        body("address_type").isIn(['home', 'work', 'other']).withMessage("Invalid address type"),
        body("full_name").notEmpty().withMessage("Full name is required"),
        body("phone").isMobilePhone().withMessage("Valid phone number is required"),
        body("address_line_1").notEmpty().withMessage("Address line 1 is required"),
        body("address_line_2").optional(),
        body("city").notEmpty().withMessage("City is required"),
        body("state").notEmpty().withMessage("State is required"),
        body("postal_code").notEmpty().withMessage("Postal code is required"),
        body("country").notEmpty().withMessage("Country is required"),
        body("is_default").optional().isBoolean().withMessage("is_default must be boolean")
    ],
    addAddress)

// Get user's addresses
addressRouter.get("/addresses/user", verifyUser, getUserAddresses)

// Get default address
addressRouter.get("/addresses/default", verifyUser, getDefaultAddress)

// Get addresses by type
addressRouter.get("/addresses/type/:address_type", verifyUser, getAddressesByType)

// Get single address
addressRouter.get("/addresses/:address_id", verifyUser, getSingleAddress)

// Update address
addressRouter.patch("/addresses/:address_id",
    verifyUser,
    [
        body("address_type").isIn(['home', 'work', 'other']).withMessage("Invalid address type"),
        body("full_name").notEmpty().withMessage("Full name is required"),
        body("phone").isMobilePhone().withMessage("Valid phone number is required"),
        body("address_line_1").notEmpty().withMessage("Address line 1 is required"),
        body("address_line_2").optional(),
        body("city").notEmpty().withMessage("City is required"),
        body("state").notEmpty().withMessage("State is required"),
        body("postal_code").notEmpty().withMessage("Postal code is required"),
        body("country").notEmpty().withMessage("Country is required"),
        body("is_default").optional().isBoolean().withMessage("is_default must be boolean")
    ],
    updateAddress)

// Set default address
addressRouter.patch("/addresses/:address_id/default", verifyUser, setDefaultAddress)

// Delete address
addressRouter.delete("/addresses/:address_id", verifyUser, deleteAddress)

module.exports = addressRouter
