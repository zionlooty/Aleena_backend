const { DB } = require("../sql")
const { validationResult } = require("express-validator")







module.exports.NewProduct = (req, res) => {


    const { product_name, product_price, product_description, product_quantity, discount_percentage, discount_type, product_category, product_tag } = req.body

    const fileUrl = req.file.filename





    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            // console.log(errorResponse.errors,{product_category})
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            DB.query("SELECT * FROM products WHERE product_name =?", [product_name], (er, product) => {
                if (er) {
                    res.status(500).json({ message: "error fetching product" })
                } else {
                    if (product.length > 0) {
                        res.status(400).json({ message: "product name already existed" })
                    }else{
                        DB.query("INSERT INTO products(product_name, product_price, product_description, product_quantity, discount_percentage,discount_type, product_image,product_category,product_tag) VALUES(?,?,?,?,?,?,?,?,?)", [product_name, product_price, product_description, product_quantity, discount_percentage, discount_type, fileUrl, product_category, product_tag], (e, _) => {
                            if (e) {
                                console.log(e)
                                res.status(500).json({ message: "unable to add new product" })
                            } else {
                                res.status(201).json({ message: "new product successfully" })
                            }
                        })
                    }
                }
            })
          
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message || "something went wrong" })
    }
}
 module.exports.singleProduct= (req, res) =>{
    const { product_id } = req.params
    try {
        if (!product_id) {
            return res.status(400).json({ message: "Product ID is required" })
        }
        DB.query("SELECT * FROM products WHERE product_id =?", [product_id], (e, product)=>{
            if(e){
                res.status(500).json({message: "error fetching product"})
            }else{
                if(product.length > 0){
                    res.status(200).json({message: product[0]})
                }else{
                    res.status(404).json({message: "product not found"})
                }
            }
        })
    } catch (error) {
        res.status(500).json({message: error.message || "something went wrong"})
    }
 }

module.exports.updateProduct = (req, res) => {
    const { product_id } = req.params
    const { product_name, product_price, product_description, product_quantity } = req.body
    const errorResponse = validationResult(req)


    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({
                error: errorResponse.array()
            })
        }

        DB.query(
            "UPDATE products SET product_name = ?, product_price = ?, product_description = ?, product_quantity = ? WHERE product_id = ?",
            [product_name, product_price, product_description, product_quantity, product_id],
            (err, product) => {
                if (err) {
                    res.status(500).json({ message: "Unable to update product" })
                }

                if (product.affectedRows === 0) {
                    res.status(404).json({ message: "Product not found" })
                }

                res.status(200).json({ message: "Product successfully updated" })
            }
        )
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}


module.exports.getAllProduct = (req, res) => {
            
    try {
        DB.query("SELECT * FROM products", (e, products) => {
            if (e) {
                res.status(500).json({ message: "unable to fetch product" })
            } else {
                if (products.length > 0) {
                    res.status(201).json({ message: products })
                } else {
                    res.status(404).json({ message: "no products found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}


module.exports.deleteProduct = (req, res) => {
    const { product_id } = req.params

    try {
        if (!product_id) {
            return res.status(400).json({ message: "Product ID is required" })
        }


        DB.query("SELECT * FROM products WHERE product_id = ?", [product_id], (er, products) => {
            if (er) {
                return res.status(500).json({ message: "Error checking product" })
            } else {

                if (products.length === 0) {
                    return res.status(404).json({ message: "Product not found" })
                }
            }



            DB.query("DELETE FROM products WHERE product_id = ?", [product_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete product" })
                }

                res.status(200).json({ message: "Product deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}


module.exports.Product= (req, res) =>{
    const { product_category } = req.params
    try {
        if (!product_category) {
            return res.status(400).json({ message: "product_category is required" })
        }
        DB.query("SELECT * FROM products WHERE product_category =?", [product_category], (e, product)=>{
            if(e){
                res.status(500).json({message: "error fetching product"})
            }else{
                if(product.length > 0){
                    res.status(200).json({message: product})
                }else{
                    res.status(404).json({message: "product not found"})
                }
            }
        })
    } catch (error) {
        res.status(500).json({message: error.message || "something went wrong"})
    }
 }

// Get product options (categories, tags, discount types)
module.exports.getProductOptions = (req, res) => {
    try {
        const options = {
            categories: [
                { value: "rings", label: "Rings" },
                { value: "necklaces", label: "Necklaces" },
                { value: "earrings", label: "Earrings" },
                { value: "bracelets", label: "Bracelets" },
                { value: "watches", label: "Watches" },
                { value: "chains", label: "Chains" },
                { value: "pendants", label: "Pendants" }
            ],
            tags: [
                { value: "new-arrival", label: "New Arrival" },
                { value: "best-seller", label: "Best Seller" },
                { value: "limited-edition", label: "Limited Edition" },
                { value: "sale", label: "Sale" },
                { value: "premium", label: "Premium" },
                { value: "handcrafted", label: "Handcrafted" }
            ],
            discountTypes: [
                { value: "promo", label: "Promotional" },
                { value: "seasonal", label: "Seasonal" },
                { value: "clearance", label: "Clearance" },
                { value: "black-friday", label: "Black Friday" }
            ]
        };

        res.status(200).json({ message: options });
    } catch (error) {
        console.error("Error fetching product options:", error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
}