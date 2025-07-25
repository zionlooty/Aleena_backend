const { DB } = require("../sql")
const { validationResult } = require("express-validator")


module.exports.addtoCart = (req, res) => {
    const { product_id, product_price, product_quantity } = req.body

    const {id} = req.user
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            DB.query("SELECT * FROM carts WHERE product_id = ? AND user_id = ?",
                [product_id, id],
                (er, product)=>{
                if(er){
                    res.status(500).json({message: "fail to add to cart"})
                }else{
                    if(product.length > 0){
                        res.status(400).json({message: "product already in cart"})
                    }else{
                        DB.query("INSERT INTO carts(product_id, product_price, product_quantity, user_id) VALUES (?,?,?,?)", [product_id, product_price, product_quantity, id], (e, _) => {
                            if (e) {
                                res.status(500).json({ message: "unable to add items to cart" })
                            } else {
                                res.status(201).json({ message: "item added to cart" })
                            }
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}


module.exports.getAllcart = (req, res) => {
    try {
        DB.query("SELECT * FROM carts", (e, carts) => {
            if (e) {
                res.status(500).json({ message: "error fetching carts items" })
            } else {
                if (carts.length > 0) {
                    res.status(200).json({ message: carts })
                } else {
                    res.status(404).json({ message: "carts items not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}


module.exports.updateCart = (req, res) => {
    const { cart_id } = req.params
    const { product_id, product_price,product_quantity } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!errorResponse.isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }


        DB.query("SELECT * FROM carts WHERE cart_id = ?", [cart_id], (e, cart) => {
            if (e) {
                return res.status(500).json({ message: "Error checking cart" })
            }

            if (cart.length === 0) {
                return res.status(404).json({ message: "Cart not found" })
            }
             DB.query(

                "UPDATE carts SET  product_id = ?, product_price = ?, product_quantity = ? WHERE cart_id = ?",
                [product_id, product_price, product_quantity, cart_id],
                (er, _) => {
                    if (er) {
                        return res.status(500).json({ message: "Unable to update cart" })
                    } else {
                        res.status(200).json({ message: "Cart successfully updated" })
                    }
                }
            )
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
} 



module.exports.deleteCart = (req, res) => {
        const {cart_id} = req.params

        try {
            if(!cart_id){
                res.status(500).json({message: "cart ID required"})
            }DB.query("SELECT * FROM carts WHERE cart_id=?", [cart_id],(e, carts)=>{
                if(e){
                    res.status(500).json({message: "error checking cart items"})
                }else{
                    if(carts.length === 0){
                        res.status(404).json({message: "cart items not found"})
                    }DB.query("DELETE FROM carts WHERE cart_id = ?", [cart_id],(er, _)=>{
                        if(er){
                            res.status(500).json({message: "unable to delete cart item"})
                        }
                        res.status(200).json({message: "cart item successfully deleted "})
                    })
                }
            })
        } catch (error) {
           res.status(500).json({message: error.message || "something went wrong"}) 
        }
}


module.exports.getCart =(req, res)=>{
    const {id}=req.user
    try {
        // First try to get cart with product details via JOIN (handle string/int mismatch)
        DB.query(`
            SELECT c.*, p.product_name, p.product_description, p.product_image, p.product_quantity as available_stock
            FROM carts c
            LEFT JOIN products p ON CAST(c.product_id AS UNSIGNED) = p.product_id
            WHERE c.user_id = ?
        `, [id], (e, cart)=>{
            if(e){
                console.error("Error fetching cart with JOIN:", e)
                console.log("Trying fallback method without JOIN...")

                // Fallback: Get cart without JOIN and add generic product info
                DB.query("SELECT * FROM carts WHERE user_id = ?", [id], (fallbackErr, fallbackCart) => {
                    if(fallbackErr){
                        console.error("Fallback cart fetch failed:", fallbackErr)
                        res.status(500).json({message: "Error fetching cart"})
                    } else {
                        if(fallbackCart.length > 0){
                            // Add missing fields with default values
                            const enrichedCart = fallbackCart.map(item => ({
                                ...item,
                                product_name: `Product ${item.product_id}`,
                                product_description: `Product description for ID ${item.product_id}`,
                                product_image: '/default-product.jpg',
                                available_stock: 999 // Default high stock for fallback
                            }))
                            res.status(200).json({message: enrichedCart})
                        } else {
                            res.status(400).json({ message: "cart not found" })
                        }
                    }
                })
            } else {
                if(cart.length > 0){
                    // Ensure all items have product_name (in case JOIN didn't find product)
                    const enrichedCart = cart.map(item => ({
                        ...item,
                        product_name: item.product_name || `Product ${item.product_id}`,
                        product_description: item.product_description || `Product description for ID ${item.product_id}`,
                        product_image: item.product_image || '/default-product.jpg'
                    }))
                    res.status(200).json({message: enrichedCart})
                } else {
                    res.status(400).json({ message: "cart not found" })
                }
            }
        })
    } catch (error) {
        console.error("Unexpected error in getCart:", error)
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}

// Update cart quantity only
module.exports.updateCartQuantity = (req, res) => {
    const { cart_id } = req.params
    const { product_quantity } = req.body
    const { id: user_id } = req.user

    try {
        if (!product_quantity || product_quantity < 1) {
            return res.status(400).json({ message: "Valid quantity is required" })
        }

        // First check if cart item exists and belongs to user, and get product info
        DB.query(`
            SELECT c.*, p.product_quantity as available_stock, p.product_name
            FROM carts c
            LEFT JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ? AND c.user_id = ?
        `, [cart_id, user_id], (checkErr, cart) => {
            if (checkErr) {
                console.error("Error checking cart:", checkErr)
                return res.status(500).json({ message: "Error checking cart" })
            }

            if (cart.length === 0) {
                return res.status(404).json({ message: "Cart item not found" })
            }

            const cartItem = cart[0]
            const availableStock = cartItem.available_stock

            // Check if requested quantity exceeds available stock
            if (product_quantity > availableStock) {
                return res.status(400).json({
                    message: `Cannot add ${product_quantity} items. Only ${availableStock} available in stock`,
                    available_stock: availableStock,
                    requested_quantity: product_quantity,
                    product_name: cartItem.product_name
                })
            }

            // Update only the quantity
            DB.query(
                "UPDATE carts SET product_quantity = ? WHERE cart_id = ? AND user_id = ?",
                [product_quantity, cart_id, user_id],
                (updateErr, result) => {
                    if (updateErr) {
                        console.error("Error updating cart quantity:", updateErr)
                        return res.status(500).json({ message: "Unable to update quantity" })
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: "Cart item not found or not updated" })
                    }

                    res.status(200).json({
                        message: "Quantity updated successfully",
                        cart_id: cart_id,
                        new_quantity: product_quantity,
                        available_stock: availableStock,
                        product_name: cartItem.product_name
                    })
                }
            )
        })
    } catch (error) {
        console.error("Unexpected error in updateCartQuantity:", error)
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}