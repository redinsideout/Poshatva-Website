# 🌿 Poshatva — Organic Plant-Based Ecommerce Platform

A full-stack, production-ready ecommerce website for **Poshtva**, selling organic plant-based products like cocopeat, vermicompost, bone meal, potting mix, and fertilizers.

---

## 🚀 Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 19, Tailwind CSS, Framer Motion       |
| Backend  | Node.js, Express 5, MVC Architecture        |
| Database | MongoDB + Mongoose ODM                      |
| Auth     | JWT (JSON Web Tokens)                       |
| Payments | Razorpay (UPI, Cards, Wallets, Net Banking) |
| Email    | Nodemailer (Gmail SMTP)                     |
| Security | Helmet, CORS, bcryptjs                      |

---

## 📁 Folder Structure

```
Poshatva/
├── poshtva-backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect + adminOnly
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── Cart.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/                # Image uploads (gitignored)
│   ├── utils/
│   │   ├── sendEmail.js        # Nodemailer
│   │   └── seedData.js         # DB Seeder
│   ├── server.js
│   ├── .env                    # Environment variables
│   └── package.json
│
└── poshtva-frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.js
    │   │   ├── auth.js
    │   │   ├── products.js
    │   │   ├── cart.js
    │   │   └── index.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── AdminLayout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── OrderStatusBadge.jsx
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Products.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── OrderSuccess.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   ├── OrderDetail.jsx
    │   │   ├── NotFound.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminProductForm.jsx
    │   │       ├── AdminOrders.jsx
    │   │       ├── AdminOrderDetail.jsx
    │   │       └── AdminUsers.jsx
    │   ├── App.js
    │   └── index.css
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **MongoDB** Community Edition running locally, OR a MongoDB Atlas account
- **Git** (optional but recommended)

### Step 1: Clone / Navigate to Project

```bash
cd "C:\Users\hp\Desktop\Poshatva"
```

### Step 2: Configure Backend Environment

Edit `poshtva-backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/poshtva
JWT_SECRET=your_very_secure_random_string
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> **Gmail Setup**: Enable 2FA on your Gmail, then generate an App Password at https://myaccount.google.com/apppasswords

> **Razorpay**: Get test keys from https://dashboard.razorpay.com → Settings → API Keys

### Step 3: Seed the Database

```bash
cd poshtva-backend
npm run seed
```

This creates:

- 5 product categories
- 8 sample products
- Admin account: `admin@poshtva.com` / `Admin@1234`

### Step 4: Start the Backend

```bash
# In poshtva-backend
npm run dev
```

Server runs at: http://localhost:5000

### Step 5: Start the Frontend

```bash
# In poshtva-frontend
npm start
```

Frontend runs at: http://localhost:3000

---

## 🔗 API Endpoints

### Auth

| Method | Endpoint           | Access  | Description       |
| ------ | ------------------ | ------- | ----------------- |
| POST   | /api/auth/register | Public  | Register new user |
| POST   | /api/auth/login    | Public  | Login user        |
| GET    | /api/auth/me       | Private | Get current user  |
| PUT    | /api/auth/profile  | Private | Update profile    |

### Products

| Method | Endpoint            | Access | Description           |
| ------ | ------------------- | ------ | --------------------- |
| GET    | /api/products       | Public | Get all with filters  |
| GET    | /api/products/:slug | Public | Get product by slug   |
| POST   | /api/products       | Admin  | Create product        |
| PUT    | /api/products/:id   | Admin  | Update product        |
| DELETE | /api/products/:id   | Admin  | Delete product (soft) |

### Orders

| Method | Endpoint               | Access  | Description         |
| ------ | ---------------------- | ------- | ------------------- |
| POST   | /api/orders            | Private | Create order        |
| GET    | /api/orders/my         | Private | Get user orders     |
| GET    | /api/orders/:id        | Private | Get order by ID     |
| PUT    | /api/orders/:id/pay    | Private | Mark as paid        |
| GET    | /api/orders/admin      | Admin   | Get all orders      |
| PUT    | /api/orders/:id/status | Admin   | Update order status |

### Payment

| Method | Endpoint                  | Access  | Description              |
| ------ | ------------------------- | ------- | ------------------------ |
| POST   | /api/payment/create-order | Private | Create Razorpay order    |
| POST   | /api/payment/verify       | Private | Verify payment signature |

---

## 🎨 Features

### User Features

- ✅ Homepage with hero, categories, featured products, testimonials
- ✅ Product listing with search, category & price filters, pagination, sort
- ✅ Product detail with image gallery, quantity selector, reviews
- ✅ Persistent cart (synced to backend)
- ✅ Checkout with shipping form + Razorpay payment
- ✅ Order history and tracking with status timeline
- ✅ JWT authentication (Login / Register)
- ✅ Profile management
- ✅ Email confirmation after payment

### Admin Panel (`/admin/dashboard`)

- ✅ Dashboard: revenue, users, products, orders stats
- ✅ Recent orders overview
- ✅ Product CRUD with image upload
- ✅ Order management with status update + tracking ID
- ✅ User directory

### Technical Features

- ✅ MVC folder structure
- ✅ JWT-secured routes
- ✅ Helmet + CORS security headers
- ✅ Multer image uploads
- ✅ Soft-delete for products/categories
- ✅ MongoDB aggregations for stats
- ✅ Environment variables
- ✅ Mobile responsive (all pages)
- ✅ Framer Motion animations
- ✅ SEO-friendly URLs (product slugs)

---

## 🌐 Deployment Notes

### Backend (Render / Railway / EC2)

1. Set all `.env` variables in the hosting dashboard
2. Point `MONGODB_URI` to MongoDB Atlas
3. `npm start` (uses `node server.js`)

### Frontend (Vercel / Netlify)

1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. `npm run build` → deploy the `build/` folder

---

## 📧 Contact

**Poshtva** · hello@poshtva.com · +91 98765 43210
