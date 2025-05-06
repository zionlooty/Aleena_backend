const express = require("express")
const cors = require("cors")
const userRouter = require("./routes/user.route")
const productRouter = require("./routes/product.route")
const orderRouter = require("./routes/order.route")
const cartRouter = require("./routes/cart.route")
require("dotenv").config()

const app = express()
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}))


app.use("/", userRouter)
app.use("/", productRouter)
app.use("/", orderRouter)
app.use("/", cartRouter)
const port = process.env.PORT || 8888
app.listen(port, ()=>console.log(`Server running on PORT: ${port}`))