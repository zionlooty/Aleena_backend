# Jewelry Store API Documentation

## Base URL
```
http://localhost:8888/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "message": "Success message or data",
  "error": "Error message (if any)"
}
```

---

## User Management

### Create User
- **POST** `/new/user`
- **Body**: `{ fullname, mobile, email, password }`

### User Login
- **POST** `/user/login`
- **Body**: `{ email_number, password }`

### Get Current User
- **GET** `/user`
- **Auth**: Required

### Update User
- **PATCH** `/user/:user_id`
- **Body**: `{ fullname, mobile, email, address }`

### Get All Users (Admin)
- **GET** `/users/all`
- **Auth**: Required

### Delete User (Admin)
- **DELETE** `/user/:user_id`
- **Auth**: Required

---

## Admin Management

### Create Admin
- **POST** `/admin/create`
- **Body**: `{ fullname, mobile, email, password, role }`

### Admin Login
- **POST** `/admin/login`
- **Body**: `{ email_number, password }`

### Get All Admins
- **GET** `/admin/all`
- **Auth**: Required

### Get Admin Profile
- **GET** `/admin/profile/me`
- **Auth**: Required

### Update Admin
- **PATCH** `/admin/:admin_id`
- **Body**: `{ fullname, mobile, email, role, status }`

### Change Admin Password
- **PATCH** `/admin/:admin_id/password`
- **Body**: `{ current_password, new_password }`

### Delete Admin
- **DELETE** `/admin/:admin_id`
- **Auth**: Required

---

## Product Management

### Add Product
- **POST** `/new/product`
- **Body**: FormData with product details and image
- **Auth**: Required

### Get All Products
- **GET** `/products`

### Get Single Product
- **GET** `/product/:product_id`

### Update Product
- **PATCH** `/product/:product_id`
- **Body**: `{ product_name, product_price, product_description, product_quantity }`

### Delete Product
- **DELETE** `/product/:product_id`
- **Auth**: Required

### Get Products by Category
- **GET** `/products/category/:product_category`

---

## Cart Management

### Add to Cart
- **POST** `/add/cart`
- **Body**: `{ product_id, product_price, product_quantity }`
- **Auth**: Required

### Get Cart Items
- **GET** `/cart`
- **Auth**: Required

### Update Cart Item
- **PATCH** `/cart/:cart_id`
- **Body**: `{ product_quantity }`

### Delete Cart Item
- **DELETE** `/cart/:cart_id`
- **Auth**: Required

---

## Order Management

### Create Order
- **POST** `/orders/create`
- **Body**: `{ items, total_amount, delivery_address }`
- **Auth**: Required

### Get All Orders (Admin)
- **GET** `/orders/all`
- **Auth**: Required

### Get User Orders
- **GET** `/orders/user`
- **Auth**: Required

### Get Single Order
- **GET** `/orders/:order_id`
- **Auth**: Required

### Update Order Status
- **PATCH** `/orders/:order_id/status`
- **Body**: `{ delivery_status }`

---

## Advertisements & Promotions

### Create Advertisement
- **POST** `/ads/create`
- **Body**: FormData with ad details and image
- **Auth**: Required

### Get All Ads
- **GET** `/ads/all`
- **Auth**: Required

### Get Active Ads (Public)
- **GET** `/ads/active`

### Update Advertisement
- **PATCH** `/ads/:ad_id`
- **Body**: Ad details
- **Auth**: Required

### Delete Advertisement
- **DELETE** `/ads/:ad_id`
- **Auth**: Required

### Create Promotion
- **POST** `/promotions/create`
- **Body**: `{ promo_code, title, description, discount_type, discount_value, ... }`
- **Auth**: Required

### Get All Promotions
- **GET** `/promotions/all`
- **Auth**: Required

### Validate Promo Code
- **POST** `/promotions/validate`
- **Body**: `{ promo_code, order_amount }`

---

## Refund Management

### Create Refund Request
- **POST** `/refunds/create`
- **Body**: `{ order_id, reason, description, refund_amount }`
- **Auth**: Required

### Get All Refunds (Admin)
- **GET** `/refunds/all`
- **Auth**: Required

### Get User Refunds
- **GET** `/refunds/user`
- **Auth**: Required

### Get Refund Statistics
- **GET** `/refunds/stats`
- **Auth**: Required

### Update Refund Status
- **PATCH** `/refunds/:refund_id/status`
- **Body**: `{ status, admin_notes, processed_amount }`
- **Auth**: Required

### Cancel Refund Request
- **PATCH** `/refunds/:refund_id/cancel`
- **Auth**: Required

---

## Analytics & Dashboard

### Get Dashboard Statistics
- **GET** `/analytics/dashboard`
- **Auth**: Required

### Get Sales Analytics
- **GET** `/analytics/sales?period=7days`
- **Auth**: Required

### Get Product Analytics
- **GET** `/analytics/products`
- **Auth**: Required

### Get User Analytics
- **GET** `/analytics/users`
- **Auth**: Required

### Get Order Analytics
- **GET** `/analytics/orders`
- **Auth**: Required

### Get Revenue Analytics
- **GET** `/analytics/revenue?period=monthly`
- **Auth**: Required

---

## Contact & Support

### Submit Contact Form
- **POST** `/contact/submit`
- **Body**: `{ name, email, phone, subject, message }`

### Get Contact Messages (Admin)
- **GET** `/contact/messages`
- **Auth**: Required

### Update Contact Status
- **PATCH** `/contact/messages/:contact_id`
- **Body**: `{ status, admin_response }`
- **Auth**: Required

### Create Support Ticket
- **POST** `/support/tickets/create`
- **Body**: `{ subject, description, priority, category }`
- **Auth**: Required

### Get Support Tickets
- **GET** `/support/tickets/all` (Admin)
- **GET** `/support/tickets/user` (User)
- **Auth**: Required

### Update Support Ticket
- **PATCH** `/support/tickets/:ticket_id`
- **Body**: `{ status, priority, admin_response }`
- **Auth**: Required

---

## Address Management

### Add Address
- **POST** `/addresses/add`
- **Body**: `{ address_type, full_name, phone, address_line_1, city, state, postal_code, country }`
- **Auth**: Required

### Get User Addresses
- **GET** `/addresses/user`
- **Auth**: Required

### Get Default Address
- **GET** `/addresses/default`
- **Auth**: Required

### Update Address
- **PATCH** `/addresses/:address_id`
- **Body**: Address details
- **Auth**: Required

### Set Default Address
- **PATCH** `/addresses/:address_id/default`
- **Auth**: Required

### Delete Address
- **DELETE** `/addresses/:address_id`
- **Auth**: Required

---

## Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
