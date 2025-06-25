const { DB } = require("../sql")
const { validationResult } = require("express-validator")

// Add new address
module.exports.addAddress = (req, res) => {
    const { 
        address_type, 
        full_name, 
        phone, 
        address_line_1, 
        address_line_2, 
        city, 
        state, 
        postal_code, 
        country,
        is_default = false 
    } = req.body
    const { id: user_id } = req.user
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            // If this is set as default, update other addresses to not be default
            if (is_default) {
                DB.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [user_id], (err) => {
                    if (err) {
                        console.log("Error updating default addresses:", err)
                    }
                })
            }

            DB.query("INSERT INTO addresses(user_id, address_type, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", 
            [user_id, address_type, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, new Date()], (e, result) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "Unable to add address" })
                } else {
                    res.status(201).json({ message: "Address added successfully", address_id: result.insertId })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get user's addresses
module.exports.getUserAddresses = (req, res) => {
    const { id: user_id } = req.user

    try {
        DB.query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", [user_id], (e, addresses) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch addresses" })
            } else {
                res.status(200).json({ message: addresses })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get single address
module.exports.getSingleAddress = (req, res) => {
    const { address_id } = req.params
    const { id: user_id } = req.user

    try {
        if (!address_id) {
            return res.status(400).json({ message: "Address ID is required" })
        }

        DB.query("SELECT * FROM addresses WHERE address_id = ? AND user_id = ?", [address_id, user_id], (e, address) => {
            if (e) {
                res.status(500).json({ message: "Error fetching address" })
            } else {
                if (address.length > 0) {
                    res.status(200).json({ message: address[0] })
                } else {
                    res.status(404).json({ message: "Address not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update address
module.exports.updateAddress = (req, res) => {
    const { address_id } = req.params
    const { 
        address_type, 
        full_name, 
        phone, 
        address_line_1, 
        address_line_2, 
        city, 
        state, 
        postal_code, 
        country,
        is_default 
    } = req.body
    const { id: user_id } = req.user
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        // If this is set as default, update other addresses to not be default
        if (is_default) {
            DB.query("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND address_id != ?", [user_id, address_id], (err) => {
                if (err) {
                    console.log("Error updating default addresses:", err)
                }
            })
        }

        DB.query("UPDATE addresses SET address_type = ?, full_name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?, updated_at = ? WHERE address_id = ? AND user_id = ?", 
        [address_type, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, new Date(), address_id, user_id], (err, result) => {
            if (err) {
                res.status(500).json({ message: "Unable to update address" })
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ message: "Address not found" })
                } else {
                    res.status(200).json({ message: "Address updated successfully" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Delete address
module.exports.deleteAddress = (req, res) => {
    const { address_id } = req.params
    const { id: user_id } = req.user

    try {
        if (!address_id) {
            return res.status(400).json({ message: "Address ID is required" })
        }

        DB.query("SELECT * FROM addresses WHERE address_id = ? AND user_id = ?", [address_id, user_id], (er, addresses) => {
            if (er) {
                return res.status(500).json({ message: "Error checking address" })
            } else {
                if (addresses.length === 0) {
                    return res.status(404).json({ message: "Address not found" })
                }
            }

            DB.query("DELETE FROM addresses WHERE address_id = ? AND user_id = ?", [address_id, user_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete address" })
                }
                res.status(200).json({ message: "Address deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Set default address
module.exports.setDefaultAddress = (req, res) => {
    const { address_id } = req.params
    const { id: user_id } = req.user

    try {
        if (!address_id) {
            return res.status(400).json({ message: "Address ID is required" })
        }

        // Check if address exists and belongs to user
        DB.query("SELECT * FROM addresses WHERE address_id = ? AND user_id = ?", [address_id, user_id], (er, address) => {
            if (er) {
                return res.status(500).json({ message: "Error checking address" })
            } else {
                if (address.length === 0) {
                    return res.status(404).json({ message: "Address not found" })
                }
            }

            // Update all addresses to not be default
            DB.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [user_id], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error updating addresses" })
                }

                // Set the specified address as default
                DB.query("UPDATE addresses SET is_default = 1 WHERE address_id = ? AND user_id = ?", [address_id, user_id], (e, _) => {
                    if (e) {
                        return res.status(500).json({ message: "Unable to set default address" })
                    }
                    res.status(200).json({ message: "Default address updated successfully" })
                })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get default address
module.exports.getDefaultAddress = (req, res) => {
    const { id: user_id } = req.user

    try {
        DB.query("SELECT * FROM addresses WHERE user_id = ? AND is_default = 1", [user_id], (e, address) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch default address" })
            } else {
                if (address.length > 0) {
                    res.status(200).json({ message: address[0] })
                } else {
                    res.status(404).json({ message: "No default address found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get addresses by type
module.exports.getAddressesByType = (req, res) => {
    const { address_type } = req.params
    const { id: user_id } = req.user

    try {
        if (!address_type) {
            return res.status(400).json({ message: "Address type is required" })
        }

        DB.query("SELECT * FROM addresses WHERE user_id = ? AND address_type = ? ORDER BY is_default DESC, created_at DESC", [user_id, address_type], (e, addresses) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch addresses" })
            } else {
                res.status(200).json({ message: addresses })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}
