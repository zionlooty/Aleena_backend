const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports.verifyUser = (req, res, next)=>{

    const token = req.headers.authorization
    const authToken = token ? token.split(" ")[1] : null
    
    try {
        
        if(authToken){
            const verifyToken  = jwt.verify(authToken, process.env.JWT_SECRET)
            if(verifyToken){
                req.user = {id: verifyToken.id}
                next()
            }else{
                res.status(403).json({message: "Token expired"})
            }
        }

    } catch (error) {
        res.status(500).json({message: "Invalid token or please login"})
    }
}