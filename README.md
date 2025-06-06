🛒 Online Electronics Store (Full Stack)

This project is a full-stack implementation of an Online Electronics Store, running as a backend server and a frontend web app. There is user login/authentication support, product listing, add/edit cart (checkout/continue shopping), admin capabilities (add/edit products) and other functionalities.

📁 Project Structure

I.	oop_server/ - Node.js backend with TypeScript that has domain modelling (business logic), CSV-based persistence, and RESTful API.
II.	oop_web/ - React frontend app that acts as the UI and interacts with the backend via HTTP, has validation and is reactive.

🚀 How to Run

From the root of the project.

Run backend:

cd oop_server
npm run start
 
Run frontend:

cd oop_web
npm run start
 
•	Backend will run at: http://localhost:4000
•	Frontend will run at: http://localhost:3000

🔑 Authentication

Login via JWT
Two user roles: admin and user.
Token is valid for 2 hours.

📬 API Overview (shown with Postman)
General

GET/api/health: check service health.
POST/api/auth/register: register a user.
POST/api/auth/login: log in and get JWT token.
GET/api/auth/me: get info on current user.

Products

GET/api/products: list products or search for products.
GET/api/products/:id: get product details.
(Admin) POST,PATCH,DELETE/api/products: admin product CRUD.

Cart

GET/api/cart: view cart.
POST/api/cart: to add item.
PATCH/api/cart/:productId: to update quantity.
DELETE/api/cart/:productId: to remove item.
DELETE/api/cart: to clear cart.

Orders & Payments

POST/api/orders/checkout: create an order.
GET/api/orders: list user order.
GET/api/orders/:id: get details of an order.
GET/api/orders/:id/payments: get payment for the order.

Notifications

GET/api/notifications: user’s notifications.
PATCH/api/notifications/:id/seen: mark as seen.

Admin Apis

GET/api/admin/audit-trail: view audit trail of all system events.
GET/api/admin/reorders: view low stock alerts.
GET/api/admin/users: view users.
GET/api/admin/notifications: view all notifications.

🌐 Frontend Functionalities

Client UI

Register and Login
Search and browse products
View cart, add items, update quantity, remove items, clear cart
Checkout flow
Notifications panel (mark as seen)

Admin UI

Create, edit and delete product(s)
View audit trail, reorder request(s), view users, view all notifications
Validation on stocks and prices fields

✅ Features Showcased in Video

Role-based authentication (user v. admin)
CRUD (with validation) on Products
Adding, updating, removing and clearing the entire cart lifecycle
Checkout flow with stock validation
Track orders and payments
Real-time notifications
Auditable logging of admin actions
Input validation in the frontend for price, stock and empty fields.

📝 Notes

All data is persisted in .csv files.
Utilizes a modular layered architecture, through TypeScript interfaces and domain modelling.
Authorization is JSWT based, includes automatic token refresh.
The User Interface is fully reactive, utilizing React functional components.
