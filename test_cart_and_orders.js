const { DB } = require("./sql")

console.log("🧪 Testing Cart and Order functionality...")

// Test data
const testUserId = 1
const testProductId = 1

async function runTests() {
    console.log("\n1️⃣ Testing Cart functionality...")
    
    // Test 1: Add item to cart
    await new Promise((resolve, reject) => {
        DB.query(
            "INSERT INTO carts (user_id, product_id, product_price, product_quantity) VALUES (?, ?, ?, ?)",
            [testUserId, testProductId, 99.99, 2],
            (err, result) => {
                if (err) {
                    console.error("❌ Failed to add test item to cart:", err)
                    reject(err)
                } else {
                    console.log("✅ Test item added to cart, cart_id:", result.insertId)
                    resolve(result.insertId)
                }
            }
        )
    })
    
    // Test 2: Fetch cart items (like the frontend does)
    await new Promise((resolve, reject) => {
        DB.query("SELECT * FROM carts WHERE user_id = ?", [testUserId], (err, cartItems) => {
            if (err) {
                console.error("❌ Failed to fetch cart items:", err)
                reject(err)
            } else {
                console.log("✅ Cart items fetched:", cartItems)
                
                if (cartItems.length === 0) {
                    console.log("⚠️ No cart items found")
                } else {
                    cartItems.forEach(item => {
                        console.log(`   - Cart ID: ${item.cart_id}, Product ID: ${item.product_id}, Price: ${item.product_price}, Qty: ${item.product_quantity}`)
                        if (!item.product_name) {
                            console.log("   ⚠️ Missing product_name - this will cause display issues")
                        }
                    })
                }
                resolve(cartItems)
            }
        })
    })
    
    console.log("\n2️⃣ Testing Order creation...")
    
    // Test 3: Create order from cart data
    await new Promise((resolve, reject) => {
        const testOrder = {
            user_id: testUserId,
            product_name: "Test Product",
            quantity: 2,
            delivery_status: "pending",
            delivery_address: "123 Test Street",
            amount: 199.98,
            payment_status: "pending",
            invoice_no: `TEST-${Date.now()}`
        }

        DB.query(
            "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status, invoice_no) VALUES (?,?,?,?,?,?,?,?)",
            [testOrder.user_id, testOrder.product_name, testOrder.quantity, testOrder.delivery_status, testOrder.delivery_address, testOrder.amount, testOrder.payment_status, testOrder.invoice_no],
            (err, result) => {
                if (err) {
                    console.error("❌ Failed to create test order:", err)
                    console.log("💡 This is likely the same error causing order placement to fail")
                    reject(err)
                } else {
                    console.log("✅ Test order created successfully, order_id:", result.insertId)
                    
                    // Clean up test order
                    DB.query("DELETE FROM orders WHERE invoice_no = ?", [testOrder.invoice_no], () => {
                        console.log("🧹 Test order cleaned up")
                        resolve(result.insertId)
                    })
                }
            }
        )
    })
    
    console.log("\n3️⃣ Testing complete cart-to-order flow...")
    
    // Test 4: Simulate the actual placeOrderFromCart flow
    await new Promise((resolve, reject) => {
        // Get cart items
        DB.query("SELECT * FROM carts WHERE user_id = ?", [testUserId], (err, cartItems) => {
            if (err) {
                console.error("❌ Failed to fetch cart for order:", err)
                reject(err)
                return
            }
            
            if (cartItems.length === 0) {
                console.log("⚠️ No cart items to convert to orders")
                resolve()
                return
            }
            
            console.log(`📦 Found ${cartItems.length} cart items to convert to orders`)
            
            let ordersCreated = 0
            let orderErrors = 0
            
            cartItems.forEach((item, index) => {
                const orderData = {
                    user_id: testUserId,
                    product_name: item.product_name || `Product ${item.product_id}`,
                    quantity: item.product_quantity,
                    delivery_status: "pending",
                    delivery_address: "123 Test Street",
                    amount: item.product_price * item.product_quantity,
                    payment_status: "pending",
                    invoice_no: `FLOW-TEST-${Date.now()}-${index}`
                }

                DB.query(
                    "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, amount, payment_status, invoice_no) VALUES (?,?,?,?,?,?,?,?)",
                    [orderData.user_id, orderData.product_name, orderData.quantity, orderData.delivery_status, orderData.delivery_address, orderData.amount, orderData.payment_status, orderData.invoice_no],
                    (orderErr, orderResult) => {
                        if (orderErr) {
                            console.error(`❌ Failed to create order for cart item ${item.cart_id}:`, orderErr)
                            orderErrors++
                        } else {
                            console.log(`✅ Order created for cart item ${item.cart_id}, order_id: ${orderResult.insertId}`)
                            ordersCreated++
                        }
                        
                        // Check if all items processed
                        if (ordersCreated + orderErrors === cartItems.length) {
                            if (orderErrors > 0) {
                                console.log(`❌ ${orderErrors} orders failed out of ${cartItems.length}`)
                            } else {
                                console.log(`✅ All ${ordersCreated} orders created successfully!`)
                            }
                            
                            // Clean up test orders
                            DB.query("DELETE FROM orders WHERE invoice_no LIKE 'FLOW-TEST-%'", () => {
                                console.log("🧹 Test orders cleaned up")
                                resolve()
                            })
                        }
                    }
                )
            })
        })
    })
    
    // Clean up test cart items
    DB.query("DELETE FROM carts WHERE user_id = ?", [testUserId], () => {
        console.log("🧹 Test cart items cleaned up")
        console.log("\n🎉 All tests completed!")
        process.exit(0)
    })
}

// Run the tests
runTests().catch(err => {
    console.error("💥 Test suite failed:", err)
    process.exit(1)
})
