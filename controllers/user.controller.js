const { DB } = require("../sql")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")

module.exports.createUser = (req, res)=>{
    
    const {fullname, mobile, email, password} = req.body
    const errorResponse = validationResult(req)
    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                message:errorResponse.errors[0].msg})
        }else{
            DB.query("SELECT * FROM users WHERE email = ? OR mobile = ?",[email, mobile], (e, user)=>{
                if(e){
                    res.status(500).json({message: "Error fetching user"})
                }else{
                    if(user.length > 0){
                        res.status(400).json({message: "Mobile NO. or email already exist"})
                    }else{
                        const encryptedPassword = bcrypt.hashSync(password, 10)
                        DB.query("INSERT INTO users(fullname, mobile, email, pass_word) VALUES(?,?,?,?)",[fullname, mobile, email, encryptedPassword], (er, _)=>{
                            if(er){
                                res.status(500).json({message: "Unable to add user"})
                            }else{
                                res.status(200).json({message: "Account created Successfully"})
                            }
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({message: error.message || "Something went wrong" })
    }
}

module.exports.loginUser = (req, res)=>{

    const {email_number, password} = req.body
    const errorResponse = validationResult(req)

    try {
            if (!validationResult(req).isEmpty()) {
                res.status(400).json({
                    message:errorResponse.errors[0].msg})
        }else{
            DB.query("SELECT * FROM users WHERE email = ? OR mobile = ?",[email_number, email_number], (e, user)=>{
                if(e){
                    res.status(500).json({message: "Unable to get user"})
                }else{
                    if(user.length > 0){
                        const db_password = user[0].pass_word
                        const match = bcrypt.compareSync(password, db_password)
                        if(match){
                            res.status(200).json({message: "login successful", user:user[0]})
                        }else{
                            res.status(400).json({message: "Email or Password incorrect"})
                        }
                    }else{
                        res.status(404).json({message: "User not found"})
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({message: error.message ?? "Something went wrong"})
    }
}

module.exports.updateUser = (req, res)=>{
    const {user_id} = req.params
    const {fullname, mobile, email} = req.body
    const errorResponse = validationResult(req)
    try {

        if (!errorResponse.isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }else{
            DB.query('UPDATE users SET fullname = ?, mobile = ?, email = ? WHERE user_id = ?', [fullname, mobile, email, user_id], (e, _)=>{
                if(e){
                    res.status(500).json({message: "can't update"})
                }else{
                    res.status(200).json({message: "Your profile has been updated"})
                }
            })
        }
        
    } catch (error) {
        res.status(500).json({message: error.message ?? "Something went wrong"})
    }
}