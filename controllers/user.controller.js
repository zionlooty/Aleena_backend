const { DB } = require("../sql")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports.createUser = (req, res) => {

    const { fullname, mobile, email, password } = req.body
    const errorResponse = validationResult(req)
    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                message: errorResponse.errors[0].msg
            })
        } else {
            DB.query("SELECT * FROM users WHERE email = ? OR mobile = ?", [email, mobile], (e, user) => {
                if (e) {
                    res.status(500).json({ message: "Error fetching user" })
                } else {
                    if (user.length > 0) {
                        res.status(400).json({ message: "Mobile NO. or email already exist" })
                    } else {
                        const encryptedPassword = bcrypt.hashSync(password, 10)
                        DB.query("INSERT INTO users(fullname, mobile, email, pass_word) VALUES(?,?,?,?)", [fullname, mobile, email, encryptedPassword], (er, _) => {
                            if (er) {
                                res.status(500).json({ message: "Unable to add user" })
                            } else {
                                res.status(200).json({ message: "Account created Successfully" })
                            }
                        })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

module.exports.loginUser = (req, res) => {

    const { email_number, password } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({
                message: errorResponse.errors[0].msg
            })
        } else {
            DB.query("SELECT * FROM users WHERE email = ? OR mobile = ?", [email_number, email_number], (e, user) => {
                if (e) {
                    res.status(500).json({ message: "Unable to get user" })
                } else {
                    if (user.length > 0) {
                        const db_password = user[0].pass_word
                        const match = bcrypt.compareSync(password, db_password)
                        if (match) {
                            const token = jwt.sign({ id: user[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1d" })
                            res.status(200).json({ message: token })
                        } else {
                            res.status(400).json({ message: "Email or Password incorrect" })
                        }
                    } else {
                        res.status(404).json({ message: "User not found" })
                    }
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

module.exports.updateUser = (req, res) => {
    const { user_id } = req.params
    const { fullname, mobile, email, address } = req.body
    const errorResponse = validationResult(req)
    try {

        if (!errorResponse.isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        } else {
            DB.query('UPDATE users SET fullname = ?, mobile = ?, email = ?, address = ? WHERE user_id = ?', [fullname, mobile, email, address, user_id, ], (e, _) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "can't update" })
                } else {
                    res.status(200).json({ message: "Your profile has been updated" })
                }
            })
        }

    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}


module.exports.getUser = (req, res) => {

    const {id} = req.user

    try {
        DB.query("SELECT * FROM users WHERE user_id =?",[id], (e, user) => {
            if (e) {
                res.status(500).json({ message: "unable to fetch user" })
            } else {
                if (user.length > 0) {
                    res.status(200).json({ message: user })
                } else {
                    res.status(400).json({ message: " user not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "something went wrong" })
    }
}



module.exports.getAllUsers = (req, res) => {
    try {
      DB.query("SELECT * FROM users", (err, users) => {
        if (err) {
          return res.status(500).json({ message: "Unable to fetch users" });
        }
  
        if (users.length > 0) {
          return res.status(200).json({ users });
        } else {
          return res.status(404).json({ message: "No users found" });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: error.message ?? "Something went wrong" });
    }
  };

  
  module.exports.deleteUser = (req, res) => {
    const { user_id } = req.params

    try {
        if (!user_id) {
            return res.status(400).json({ message: "user ID is required" })
        }


        DB.query("SELECT * FROM users WHERE user_id = ?", [user_id], (er, users) => {
            if (er) {
                return res.status(500).json({ message: "Error checking user" })
            } else {

                if (users.length === 0) {
                    return res.status(404).json({ message: "user not found" })
                }
            }



            DB.query("DELETE FROM users WHERE user_id = ?", [user_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete user" })
                }

                res.status(200).json({ message: "user deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}