const { DB } = require("../sql")
const { validationResult } = require("express-validator")

// Submit contact form
module.exports.submitContactForm = (req, res) => {
    const { name, email, phone, subject, message } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            DB.query("INSERT INTO contact_messages(name, email, phone, subject, message, status, created_at) VALUES(?,?,?,?,?,?,?)", 
            [name, email, phone, subject, message, 'new', new Date()], (e, result) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "Unable to submit contact form" })
                } else {
                    res.status(201).json({ message: "Contact form submitted successfully. We'll get back to you soon!", contact_id: result.insertId })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get all contact messages (admin)
module.exports.getAllContactMessages = (req, res) => {
    const { status } = req.query
    let query = "SELECT * FROM contact_messages"
    let queryParams = []

    if (status) {
        query += " WHERE status = ?"
        queryParams.push(status)
    }
    
    query += " ORDER BY created_at DESC"

    try {
        DB.query(query, queryParams, (e, messages) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch contact messages" })
            } else {
                res.status(200).json({ message: messages })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get single contact message
module.exports.getSingleContactMessage = (req, res) => {
    const { contact_id } = req.params

    try {
        if (!contact_id) {
            return res.status(400).json({ message: "Contact ID is required" })
        }

        DB.query("SELECT * FROM contact_messages WHERE contact_id = ?", [contact_id], (e, message) => {
            if (e) {
                res.status(500).json({ message: "Error fetching contact message" })
            } else {
                if (message.length > 0) {
                    res.status(200).json({ message: message[0] })
                } else {
                    res.status(404).json({ message: "Contact message not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update contact message status
module.exports.updateContactStatus = (req, res) => {
    const { contact_id } = req.params
    const { status, admin_response } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        DB.query("UPDATE contact_messages SET status = ?, admin_response = ?, updated_at = ? WHERE contact_id = ?", 
        [status, admin_response, new Date(), contact_id], (err, result) => {
            if (err) {
                res.status(500).json({ message: "Unable to update contact message" })
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ message: "Contact message not found" })
                } else {
                    res.status(200).json({ message: "Contact message updated successfully" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Delete contact message
module.exports.deleteContactMessage = (req, res) => {
    const { contact_id } = req.params

    try {
        if (!contact_id) {
            return res.status(400).json({ message: "Contact ID is required" })
        }

        DB.query("SELECT * FROM contact_messages WHERE contact_id = ?", [contact_id], (er, messages) => {
            if (er) {
                return res.status(500).json({ message: "Error checking contact message" })
            } else {
                if (messages.length === 0) {
                    return res.status(404).json({ message: "Contact message not found" })
                }
            }

            DB.query("DELETE FROM contact_messages WHERE contact_id = ?", [contact_id], (e, _) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to delete contact message" })
                }
                res.status(200).json({ message: "Contact message deleted successfully" })
            })
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Create support ticket
module.exports.createSupportTicket = (req, res) => {
    const { subject, description, priority = 'medium', category } = req.body
    const { id: user_id } = req.user
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            res.status(400).json({ message: errorResponse.errors[0].msg })
        } else {
            // Generate ticket number
            const ticket_number = 'TKT-' + Date.now()
            
            DB.query("INSERT INTO support_tickets(ticket_number, user_id, subject, description, priority, category, status, created_at) VALUES(?,?,?,?,?,?,?,?)", 
            [ticket_number, user_id, subject, description, priority, category, 'open', new Date()], (e, result) => {
                if (e) {
                    console.log(e)
                    res.status(500).json({ message: "Unable to create support ticket" })
                } else {
                    res.status(201).json({ 
                        message: "Support ticket created successfully", 
                        ticket_id: result.insertId,
                        ticket_number: ticket_number
                    })
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Get all support tickets (admin)
module.exports.getAllSupportTickets = (req, res) => {
    const { status, priority, category } = req.query
    let query = `
        SELECT st.*, u.fullname as customer_name, u.email as customer_email
        FROM support_tickets st
        JOIN users u ON st.user_id = u.user_id
    `
    let queryParams = []
    let conditions = []

    if (status) {
        conditions.push("st.status = ?")
        queryParams.push(status)
    }
    
    if (priority) {
        conditions.push("st.priority = ?")
        queryParams.push(priority)
    }
    
    if (category) {
        conditions.push("st.category = ?")
        queryParams.push(category)
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ")
    }
    
    query += " ORDER BY st.created_at DESC"

    try {
        DB.query(query, queryParams, (e, tickets) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch support tickets" })
            } else {
                res.status(200).json({ message: tickets })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get user's support tickets
module.exports.getUserSupportTickets = (req, res) => {
    const { id: user_id } = req.user

    try {
        DB.query("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC", [user_id], (e, tickets) => {
            if (e) {
                res.status(500).json({ message: "Unable to fetch your support tickets" })
            } else {
                res.status(200).json({ message: tickets })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message ?? "Something went wrong" })
    }
}

// Get single support ticket
module.exports.getSingleSupportTicket = (req, res) => {
    const { ticket_id } = req.params

    try {
        if (!ticket_id) {
            return res.status(400).json({ message: "Ticket ID is required" })
        }

        const query = `
            SELECT st.*, u.fullname as customer_name, u.email as customer_email, u.mobile as customer_mobile
            FROM support_tickets st
            JOIN users u ON st.user_id = u.user_id
            WHERE st.ticket_id = ?
        `

        DB.query(query, [ticket_id], (e, ticket) => {
            if (e) {
                res.status(500).json({ message: "Error fetching support ticket" })
            } else {
                if (ticket.length > 0) {
                    res.status(200).json({ message: ticket[0] })
                } else {
                    res.status(404).json({ message: "Support ticket not found" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}

// Update support ticket
module.exports.updateSupportTicket = (req, res) => {
    const { ticket_id } = req.params
    const { status, priority, admin_response } = req.body
    const errorResponse = validationResult(req)

    try {
        if (!validationResult(req).isEmpty()) {
            return res.status(400).json({ errors: errorResponse.array() })
        }

        DB.query("UPDATE support_tickets SET status = ?, priority = ?, admin_response = ?, updated_at = ? WHERE ticket_id = ?", 
        [status, priority, admin_response, new Date(), ticket_id], (err, result) => {
            if (err) {
                res.status(500).json({ message: "Unable to update support ticket" })
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ message: "Support ticket not found" })
                } else {
                    res.status(200).json({ message: "Support ticket updated successfully" })
                }
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong" })
    }
}
