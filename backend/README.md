# Smart City Jamshoro — Backend API

A production-quality **Node.js / Express / MongoDB** backend for **Smart City Jamshoro**, a real estate platform for property listings, inquiries, and an AI-powered chat assistant (Google Gemini).

---

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Run Commands](#run-commands)
7. [API Reference](#api-reference)
8. [Response Format](#response-format)
9. [Security](#security)

---

## Project Description

Smart City Jamshoro is a real estate platform focused on property listings (sale/rent) in Jamshoro, Pakistan. This backend provides:

- JWT-based authentication with role-based authorization (`user`, `agent`, `admin`)
- Full CRUD for property listings with image uploads to Cloudinary
- Search, filtering, sorting, and pagination for listings
- Inquiry management for prospective buyers/renters
- An AI chat assistant powered by Google Gemini, with full conversation history stored in MongoDB
- Hardened security middleware (Helmet, rate limiting, sanitization, XSS protection)

---

## Tech Stack

| Category         | Technology                          |
|-------------------|--------------------------------------|
| Runtime           | Node.js                              |
| Framework         | Express.js                           |
| Database          | MongoDB + Mongoose                   |
| Authentication    | JWT + bcryptjs                       |
| File Storage      | Multer + Cloudinary                  |
| AI                | Google Gemini (`@google/generative-ai`) |
| Security          | Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, cors |
| Logging           | Morgan                               |
| Validation        | validator                            |

---

## Folder Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Cloudinary configuration
├── controllers/
│   ├── authController.js
│   ├── propertyController.js
│   ├── userController.js
│   ├── inquiryController.js
│   └── chatController.js
├── middleware/
│   ├── auth.js                # JWT protect middleware
│   ├── admin.js                # Role-based authorization
│   ├── errorHandler.js         # Global error handler
│   ├── notFound.js             # 404 handler
│   └── upload.js               # Multer configuration
├── models/
│   ├── User.js
│   ├── Property.js
│   ├── Inquiry.js
│   └── ChatHistory.js
├── routes/
│   ├── authRoutes.js
│   ├── propertyRoutes.js
│   ├── userRoutes.js
│   ├── inquiryRoutes.js
│   └── chatRoutes.js
├── services/
│   └── geminiService.js       # Google Gemini integration
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   └── generateToken.js
├── uploads/                    # Temp storage before Cloudinary upload
├── .env                        # Environment variables (empty by default)
├── .gitignore
├── app.js                      # Express app configuration
├── server.js                   # Entry point
├── package.json
└── README.md
```

---

## Installation

1. **Clone / extract the project** and move into the backend folder:

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables** — see [Environment Variables](#environment-variables) below. Fill in the empty `.env` file with your own values.

4. **Run the server** — see [Run Commands](#run-commands).

> The project will not start correctly until `MONGO_URI` and `JWT_SECRET` are provided. Cloudinary and Gemini variables are required only for image upload and AI chat features respectively.

---

## Environment Variables

Create/populate the `.env` file in the project root. All keys already exist in the file — just fill in the values:

| Variable                 | Description                                              |
|----------------------------|------------------------------------------------------------|
| `PORT`                    | Port the server listens on (e.g. `5000`)                  |
| `NODE_ENV`                | `development` or `production`                             |
| `MONGO_URI`               | MongoDB connection string                                  |
| `JWT_SECRET`              | Secret key used to sign JWTs                                |
| `JWT_EXPIRES_IN`          | JWT expiry (e.g. `7d`)                                      |
| `SESSION_SECRET`          | Secret used by express-session                              |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary account cloud name                                |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                                           |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                                        |
| `GEMINI_API_KEY`          | Google Gemini API key for the AI chat feature                |
| `CLIENT_URL`              | Frontend origin allowed by CORS (e.g. `http://localhost:3000`) |

**Never commit real credentials.** `.env` is included in `.gitignore`.

---

## Run Commands

```bash
# Install dependencies
npm install

# Start in development mode (auto-restart with nodemon)
npm run dev

# Start in production mode
npm start
```

---

## API Reference

Base URL: `/api`

### Auth — `/api/auth`

| Method | Endpoint         | Access  | Description               |
|--------|-------------------|---------|----------------------------|
| POST   | `/register`       | Public  | Register a new user        |
| POST   | `/login`          | Public  | Login and receive JWT      |
| POST   | `/logout`         | Private | Logout (clears cookie)     |
| GET    | `/me`             | Private | Get current user profile   |

### Properties — `/api/properties`

| Method | Endpoint         | Access          | Description                                   |
|--------|-------------------|-----------------|------------------------------------------------|
| GET    | `/`               | Public          | List properties (search/filter/sort/paginate)  |
| GET    | `/id/:id`         | Public          | Get property by MongoDB ID                     |
| GET    | `/slug/:slug`     | Public          | Get property by slug                            |
| POST   | `/`               | Private         | Create property (multipart, field: `images`)   |
| PUT    | `/:id`            | Private (owner/admin) | Update property                          |
| DELETE | `/:id`            | Private (owner/admin) | Delete property + Cloudinary images      |

**Supported query params on `GET /api/properties`:** `search`, `city`, `purpose`, `type`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `status`, `sort` (`newest`, `oldest`, `price_asc`, `price_desc`), `page`, `limit`.

### Users — `/api/users`

| Method | Endpoint            | Access        | Description               |
|--------|----------------------|---------------|-----------------------------|
| PUT    | `/profile`           | Private       | Update own profile          |
| PUT    | `/change-password`   | Private       | Change own password         |
| GET    | `/`                  | Admin         | List all users (paginated)  |
| GET    | `/:id`               | Admin         | Get a single user            |
| PUT    | `/:id/role`          | Admin         | Update a user's role         |
| DELETE | `/:id`               | Admin         | Delete a user                 |

### Inquiries — `/api/inquiries`

| Method | Endpoint         | Access | Description                    |
|--------|-------------------|--------|----------------------------------|
| POST   | `/`               | Public | Submit an inquiry about a property |
| GET    | `/`               | Admin  | List all inquiries (filter/paginate) |
| PUT    | `/:id/status`     | Admin  | Update inquiry status             |
| DELETE | `/:id`            | Admin  | Delete an inquiry                  |

### AI Chat — `/api/chat`

| Method | Endpoint     | Access  | Description                                  |
|--------|---------------|---------|------------------------------------------------|
| POST   | `/`           | Public  | Send a prompt, get an AI response (rate-limited) |
| GET    | `/history`    | Private | Get the logged-in user's chat history            |

### Health Check

| Method | Endpoint       | Access | Description        |
|--------|-----------------|--------|-----------------------|
| GET    | `/api/health`  | Public | API status check      |

---

## Response Format

All API responses follow this consistent shape:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null
}
```

---

## Security

This backend implements multiple layers of protection:

- **Helmet** — sets secure HTTP headers
- **express-rate-limit** — global and endpoint-specific rate limiting (extra-strict on `/api/chat`)
- **express-mongo-sanitize** — strips NoSQL injection operators from input
- **xss-clean** — sanitizes user input against XSS payloads
- **CORS** — restricts cross-origin requests to `CLIENT_URL`
- **bcryptjs** — hashes passwords with a strong salt round
- **JWT** — stored as an httpOnly, sameSite cookie
- **Centralized error handling** — no stack traces leaked in production

---

## License

MIT
