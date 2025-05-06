const { DB } = require("../sql")
const { validationResult } = require("express-validator")




module.exports.NewOrder = (req, res) => {
    const {user_id, product_name, quantity, delivery_status, delivery_address } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            DB.query("INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address ) VALUES (?,?,?,?,?)", [user_id, product_name, quantity, delivery_status, delivery_address ], (e, _) => {
                if (e) {
                    res.status(500).json({ message: "unable to add new order" })
                } else {
                    res.status(201).json({ message: "your order has been placed!" })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "something went wrong" })
    }
}



module.exports.getAllOrder =(req, res) =>{
    try {
        DB.query("SELECT * FROM orders",(e, orders)=>{
            if(e){
                res.status(500).json({message: "unable to fetch order"})
            }else{
                if(orders.length > 0){
                    res.status(201).json({message: orders})
                }else{
                    res.status(404).json({message:"order not found"})
                }
            }
        })
    } catch (error) {
      res.status(500).json({message: error.message || "something went wrong"})  
    }
}



module.exports.updateOrder = (req, res) => {
    const { order_id } = req.params;
    const { user_id, product_name, quantity, delivery_status, delivery_address } = req.body;
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            DB.query(
                "UPDATE orders SET user_id = ?, product_name = ?, quantity = ?, delivery_status = ?, delivery_address = ? WHERE order_id = ?",
                [user_id, product_name, quantity, delivery_status, delivery_address, order_id],
                (err, order) => {
                    if (err) {
                        res.status(500).json({ message: "Unable to update order" });
                    } else {
                        if (order.length === 0) {
                            res.status(404).json({ message: "Order not found" });
                        } else {
                            res.status(200).json({ message: "Order successfully updated" });
                        }
                    }
                }
            );
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
};


module.exports.deleteOrder =(req, res)=>{ 
    const {order_id} =req.params
    try {
        if (!order_id){
            res.status(400).json({message: "order ID is required"})
        }
        DB.query("SELECT * FROM orders WHERE order_id=?",[order_id], (er, order)=>{
            if(er){
                res.status(500).json({message: "error chechking order"})
            }else{
                if(order.length === 0){
                    res.status(404).json({message: "order not found"})
                }
            }
            DB.query("DELETE FROM orders WHERE order_id=?", [order_id],(e, _)=>{
                if(e){
                    res.status(400).json({message: "unable to delete order"})
                }else{
                    res.status(200).json({message: "order successfully delete"})
                }
            })
        })
    } catch (error) {
       res.status(500).json({message: error.message || "something went wrong"}) 
    }
}