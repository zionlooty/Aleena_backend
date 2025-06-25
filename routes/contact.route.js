const express = require("express")
const { 
    submitContactForm,
    getAllContactMessages,
    getSingleContactMessage,
    updateContactStatus,
    deleteContactMessage,
    createSupportTicket,
    getAllSupportTickets,
    getUserSupportTickets,
    getSingleSupportTicket,
    updateSupportTicket
} = require("../controllers/contact.controller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const contactRouter = express.Router()

// Contact form routes
// Submit contact form (public)
contactRouter.post("/contact/submit",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("phone").optional().isMobilePhone().withMessage("Valid phone number required"),
        body("subject").notEmpty().withMessage("Subject is required"),
        body("message").notEmpty().withMessage("Message is required")
    ],
    submitContactForm)

// Get all contact messages (admin)
contactRouter.get("/contact/messages", verifyUser, getAllContactMessages)

// Get single contact message
contactRouter.get("/contact/messages/:contact_id", verifyUser, getSingleContactMessage)

// Update contact message status (admin)
contactRouter.patch("/contact/messages/:contact_id",
    verifyUser,
    [
        body("status").isIn(['new', 'in_progress', 'resolved', 'closed']).withMessage("Invalid status"),
        body("admin_response").optional().notEmpty().withMessage("Admin response cannot be empty")
    ],
    updateContactStatus)

// Delete contact message (admin)
contactRouter.delete("/contact/messages/:contact_id", verifyUser, deleteContactMessage)

// Support ticket routes
// Create support ticket (user)
contactRouter.post("/support/tickets/create",
    verifyUser,
    [
        body("subject").notEmpty().withMessage("Subject is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("priority").optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage("Invalid priority"),
        body("category").isIn(['technical', 'billing', 'product', 'shipping', 'other']).withMessage("Invalid category")
    ],
    createSupportTicket)

// Get all support tickets (admin)
contactRouter.get("/support/tickets/all", verifyUser, getAllSupportTickets)

// Get user's support tickets
contactRouter.get("/support/tickets/user", verifyUser, getUserSupportTickets)

// Get single support ticket
contactRouter.get("/support/tickets/:ticket_id", verifyUser, getSingleSupportTicket)

// Update support ticket (admin)
contactRouter.patch("/support/tickets/:ticket_id",
    verifyUser,
    [
        body("status").optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage("Invalid status"),
        body("priority").optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage("Invalid priority"),
        body("admin_response").optional().notEmpty().withMessage("Admin response cannot be empty")
    ],
    updateSupportTicket)

module.exports = contactRouter
