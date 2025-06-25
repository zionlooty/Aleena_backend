const { DB } = require("../sql")
const { validationResult } = require("express-validator")

// Function to generate unique invoice number
const generateInvoiceNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${timestamp}-${random}`
}




module.exports.NewOrder = (req, res) => {
    const {user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            const invoiceNumber = generateInvoiceNumber()
            const finalTotalAmount = amount || 0
            const finalPaymentStatus = payment_status || 'pending'

            DB.query("INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status, invoice_no) VALUES (?,?,?,?,?,?,?,?)",
                [user_id, product_name, quantity, delivery_status, delivery_address, finalTotalAmount, finalPaymentStatus, invoiceNumber], (e, orderResult) => {
                if (e) {
                    console.error("Order creation error:", e)
                    res.status(500).json({ message: "unable to add new order" })
                } else {
                    // For single product orders, we can optionally also add to order_items table for consistency
                    // This makes all orders follow the same structure
                    const orderId = orderResult.insertId

                    // Note: For single product orders, we'd need product_id to insert into order_items
                    // For now, keeping the existing behavior but the order will still show in the modal
                    // because our getAllOrder function handles both cases

                    res.status(201).json({
                        message: "your order has been placed!",
                        orderId: orderId
                    })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "something went wrong" })
    }
}



module.exports.getAllOrder = async (req, res) => {
    try {
        // First, get all orders with customer information
        DB.query(`
            SELECT o.*, u.fullname as customer_name, u.email as customer_email, u.mobile as customer_mobile
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            ORDER BY o.order_id DESC
        `, async (e, orders) => {
            if (e) {
                console.error("Error fetching orders:", e)
                res.status(500).json({message: "unable to fetch order"})
                return;
            }

            if (orders.length === 0) {
                res.status(404).json({message: "order not found"})
                return;
            }

            // For each order, fetch its items from order_items table
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                return new Promise((resolve) => {
                    DB.query(`
                        SELECT oi.*, p.product_name, p.product_image
                        FROM order_items oi
                        LEFT JOIN products p ON oi.product_id = p.product_id
                        WHERE oi.order_id = ?
                    `, [order.order_id], (itemErr, items) => {
                        if (itemErr) {
                            console.error("Error fetching order items:", itemErr);
                            // If no order_items found, create a single item from the order's product_name
                            resolve({
                                ...order,
                                items: [{
                                    product_name: order.product_name || 'Unknown Product',
                                    quantity: order.quantity || 1,
                                    price: order.amount || 0,
                                    product_image: null
                                }]
                            });
                        } else if (items.length === 0) {
                            // If no order_items found, create a single item from the order's product_name
                            resolve({
                                ...order,
                                items: [{
                                    product_name: order.product_name || 'Unknown Product',
                                    quantity: order.quantity || 1,
                                    price: order.amount || 0,
                                    product_image: null
                                }]
                            });
                        } else {
                            // Use the items from order_items table
                            resolve({
                                ...order,
                                items: items
                            });
                        }
                    });
                });
            }));

            if (ordersWithItems.length > 0) {
                console.log("Sample order structure:", Object.keys(ordersWithItems[0])); // Debug log
                console.log("First order data:", JSON.stringify(ordersWithItems[0], null, 2)); // Debug log
            }
            res.status(200).json({message: ordersWithItems});
        });
    } catch (error) {
        console.error("Error in getAllOrder:", error);
        res.status(500).json({message: error.message || "something went wrong"});
    }
}

// Get orders for a specific user
module.exports.getUserOrders = (req, res) => {
    const { id: user_id } = req.user

    try {
        DB.query(`
            SELECT o.*, u.fullname as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE o.user_id = ?
            ORDER BY o.createdAt DESC
        `, [user_id], (e, orders) => {
            if (e) {
                console.error("Error fetching user orders:", e)
                res.status(500).json({ message: "Unable to fetch your orders" })
            } else {
                res.status(200).json({ message: orders })
            }
        })
    } catch (error) {
        console.error("Unexpected error in getUserOrders:", error)
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update order status (Admin)
module.exports.updateOrderStatus = (req, res) => {
    const { order_id } = req.params
    const { delivery_status, payment_status, admin_notes } = req.body

    try {
        if (!order_id) {
            return res.status(400).json({ message: "Order ID is required" })
        }

        if (!delivery_status && !payment_status) {
            return res.status(400).json({ message: "At least one status field is required" })
        }

        // Check if order exists
        DB.query("SELECT order_id FROM orders WHERE order_id = ?", [order_id], (checkErr, order) => {
            if (checkErr) {
                console.error("Error checking order:", checkErr)
                return res.status(500).json({ message: "Error checking order" })
            }

            if (order.length === 0) {
                return res.status(404).json({ message: "Order not found" })
            }

            // Build update query dynamically
            let updateFields = []
            let updateValues = []

            if (delivery_status) {
                updateFields.push("delivery_status = ?")
                updateValues.push(delivery_status)
            }

            if (payment_status) {
                updateFields.push("payment_status = ?")
                updateValues.push(payment_status)
            }

            // Note: admin_notes column may not exist in actual table, so we skip it for now
            // if (admin_notes) {
            //     updateFields.push("admin_notes = ?")
            //     updateValues.push(admin_notes)
            // }

            // Check if we have any fields to update
            if (updateFields.length === 0) {
                return res.status(400).json({ message: "No valid fields to update" })
            }

            // Note: orders table doesn't have updated_at column, so we don't update it
            updateValues.push(order_id)

            const updateQuery = `UPDATE orders SET ${updateFields.join(", ")} WHERE order_id = ?`
            console.log("Update query:", updateQuery, "Values:", updateValues)

            DB.query(updateQuery, updateValues, (updateErr, result) => {
                if (updateErr) {
                    console.error("Error updating order:", updateErr)
                    return res.status(500).json({ message: "Unable to update order status" })
                }

                return res.status(200).json({ message: "Order status updated successfully" })
            })
        })
    } catch (error) {
        console.error("Unexpected error in updateOrderStatus:", error)
        return res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get single order details (Admin)
module.exports.getSingleOrder = (req, res) => {
    const { order_id } = req.params

    try {
        if (!order_id) {
            return res.status(400).json({ message: "Order ID is required" })
        }

        DB.query(`
            SELECT o.*, u.fullname as customer_name, u.email as customer_email, u.mobile as customer_mobile
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `, [order_id], (e, order) => {
            if (e) {
                console.error("Error fetching order:", e)
                return res.status(500).json({ message: "Unable to fetch order details" })
            }

            if (order.length === 0) {
                return res.status(404).json({ message: "Order not found" })
            }

            return res.status(200).json({ message: order[0] })
        })
    } catch (error) {
        console.error("Unexpected error in getSingleOrder:", error)
        return res.status(500).json({ message: error.message || "Something went wrong" })
    }
}



module.exports.updateOrder = (req, res) => {
    const { order_id } = req.params;
    const { user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status } = req.body;
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                error:errorResponse.array()})
        } else {
            DB.query(
                "UPDATE orders SET user_id = ?, product_name = ?, quantity = ?, delivery_status = ?, delivery_address = ?, amount = ?, payment_status = ? WHERE order_id = ?",
                [user_id, product_name, quantity, delivery_status, delivery_address, amount || 0, payment_status || 'pending', order_id],
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

// Place order from cart items
module.exports.placeOrderFromCart = (req, res) => {
    const { id: user_id } = req.user
    const { delivery_address, amount } = req.body

    try {
        if (!delivery_address) {
            return res.status(400).json({ message: "Delivery address is required" })
        }

        // Get cart items directly (they should already have product_name from the updated getCart method)
        DB.query("SELECT * FROM carts WHERE user_id = ?", [user_id], (e, cartItems) => {
            if (e) {
                console.error("Error fetching cart items:", e)
                return res.status(500).json({ message: "Error fetching cart items" })
            }

            if (cartItems.length === 0) {
                return res.status(400).json({ message: "Cart is empty" })
            }

            // Ensure each item has a product_name (fallback to generic name)
            const processedItems = cartItems.map(item => ({
                ...item,
                product_name: item.product_name || `Product ${item.product_id}`,
                product_price: item.product_price || 0
            }))

            console.log("Cart items for order creation:", processedItems)
            processOrders(processedItems)
        })

        function processOrders(cartItems) {
            // Calculate total amount for the entire order
            const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.product_quantity), 0)
            const invoiceNumber = generateInvoiceNumber()

            // Create a single order with the total amount
            // Use the first item's name as the main product name, or create a summary
            const mainProductName = cartItems.length === 1
                ? cartItems[0].product_name
                : `Multiple Items (${cartItems.length} products)`

            DB.query(
                "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status, invoice_no) VALUES (?,?,?,?,?,?,?,?)",
                [user_id, mainProductName, cartItems.length, 'pending', delivery_address, totalAmount, 'pending', invoiceNumber],
                (orderErr, orderResult) => {
                    if (orderErr) {
                        console.error("Order creation error:", orderErr)
                        return res.status(500).json({
                            message: "Failed to create order"
                        })
                    }

                    const orderId = orderResult.insertId
                    console.log("Created order with ID:", orderId)

                    // Try to insert items into order_items table, with fallback if it fails
                    console.log("Attempting to insert items into order_items table...")

                    // Simple approach: try to insert, if it fails, continue anyway
                    let itemsProcessed = 0
                    let itemsInserted = 0
                    let itemErrors = 0

                    if (cartItems.length === 0) {
                        // No items to process, just clear cart and return success
                        DB.query("DELETE FROM carts WHERE user_id = ?", [user_id], (clearErr, _) => {
                            if (clearErr) {
                                return res.status(500).json({
                                    message: "Order created but failed to clear cart"
                                })
                            }
                            res.status(201).json({
                                message: "Order placed successfully!",
                                orderId: orderId,
                                itemsCount: 0,
                                totalAmount: totalAmount
                            })
                        })
                        return
                    }

                    cartItems.forEach((item, index) => {
                        console.log(`Processing cart item ${index + 1}:`, {
                            product_id: item.product_id,
                            product_quantity: item.product_quantity,
                            product_price: item.product_price,
                            product_name: item.product_name
                        })

                        DB.query(
                            "INSERT INTO order_items(order_id, product_id, quantity, price) VALUES (?,?,?,?)",
                            [orderId, item.product_id, item.product_quantity, item.product_price],
                            (itemErr, itemResult) => {
                                if (itemErr) {
                                    console.error("Order item creation error:", itemErr)
                                    console.error("SQL Error Code:", itemErr.code)
                                    console.error("SQL Error Message:", itemErr.sqlMessage)
                                    console.error("Failed item data:", {
                                        order_id: orderId,
                                        product_id: item.product_id,
                                        quantity: item.product_quantity,
                                        price: item.product_price
                                    })
                                    itemErrors++
                                } else {
                                    itemsInserted++
                                    console.log("Successfully inserted order item:", itemResult.insertId)
                                }

                                itemsProcessed++

                                // Check if all items have been processed
                                if (itemsProcessed === cartItems.length) {
                                    console.log(`Processed ${itemsProcessed} items: ${itemsInserted} successful, ${itemErrors} failed`)

                                    // Always clear the cart and return success, even if some items failed to insert into order_items
                                    // The main order was created successfully with the total amount
                                    DB.query("DELETE FROM carts WHERE user_id = ?", [user_id], (clearErr, _) => {
                                        if (clearErr) {
                                            return res.status(500).json({
                                                message: "Order created but failed to clear cart"
                                            })
                                        }

                                        res.status(201).json({
                                            message: "Order placed successfully!",
                                            orderId: orderId,
                                            itemsCount: cartItems.length,
                                            totalAmount: totalAmount,
                                            itemsInOrderTable: itemsInserted,
                                            note: itemErrors > 0 ? "Some items stored in main order record only" : "All items processed"
                                        })
                                    })
                                }
                            }
                        )
                    })
                }
            )
        }
    } catch (error) {
        console.error("Unexpected error in placeOrderFromCart:", error)
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}