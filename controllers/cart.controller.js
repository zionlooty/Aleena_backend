const { DB } = require("../sql")
const { validationResult } = require("express-validator")


module.exports.addtoCart = (req, res) => {
    const { product_id, product_price, product_quantity } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            DB.query("INSERT INTO carts(product_id, product_price, product_quantity) VALUES (?,?,?)", [product_id, product_price, product_quantity], (e, _) => {
                if (e) {
                    res.status(500).json({ message: "unable to add items to cart" })
                } else {
                    res.status(201).json({ message: "item added to cart successfully" })
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