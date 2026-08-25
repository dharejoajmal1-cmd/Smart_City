# Smart City Jamshoro — Frontend

Production-ready React frontend for the Smart City Jamshoro real estate platform.
This is a **frontend-only** project — it consumes your existing backend at
`VITE_API_BASE_URL` (default `http://localhost:5000/api`) and does not modify,
mock, or replace any backend code.

## Tech Stack
- React 19 + Vite
- React Router DOM (routing, protected/admin routes)
- Bootstrap 5 + Bootstrap Icons
- Axios (with interceptors for JWT auth, global error handling, light retry)
- Context API (Auth, Toast notifications)
- Reusable hooks, services, and utils

## Getting Started

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend
npm run dev
```

The app runs at http://localhost:5173 by default.

## Project Structure

```
src/
  api/            Axios instance + one service module per backend resource
  components/
    common/       Button, Loader, Spinner, Modal, Toast, Breadcrumb, Pagination
    layout/       Navbar, Footer, DashboardLayout, Sidebar, Topbar
    property/     PropertyCard, SearchFilter
  context/        AuthContext, ToastContext
  hooks/          useAuth, useToast, useFetch, useDebounce
  pages/          Home, About, Properties, PropertyDetails, Contact, Login,
                  Register, NotFound, dashboard/*
  routes/         PublicLayout, ProtectedRoute, AdminRoute
  utils/          formatters, validators
```

## Backend API Contract Expected

Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
`GET /auth/profile`, `PUT /users/profile`, `PUT /users/change-password`

Properties: `GET /properties`, `GET /properties/id/:id`,
`GET /properties/slug/:slug`, `POST /properties`, `PUT /properties/:id`,
`DELETE /properties/:id`

Users (admin): `GET /users`, `GET /users/:id`, `PUT /users/:id/role`,
`DELETE /users/:id`

Inquiries: `POST /inquiries`, `GET /inquiries`, `PUT /inquiries/:id/status`,
`DELETE /inquiries/:id`

AI Chat: `POST /chat`, `GET /chat/history`

The frontend reads responses defensively (`res.data?.data || res.data?.x || res.data`)
so it adapts to a plain array/object or an `{ data: ... }` envelope without any
changes to your backend's response format.

## Notes
- JWT is stored in `localStorage` (`scj_token`) and attached automatically via
  an Axios request interceptor. A 401 response clears the session app-wide.
- Image uploads (`MyProperties`) send `multipart/form-data`, matching the
  existing Cloudinary upload flow on the backend — no upload logic is
  duplicated on the frontend.
- "Saved Properties" persists property IDs in `localStorage` since no saved-
  properties endpoint was specified. Swap `useSavedIds` in
  `src/pages/dashboard/SavedProperties.jsx` for a real endpoint if one exists.
- Role-based UI: the `admin` role unlocks **Manage Users** in the sidebar and
  status controls on **My Inquiries**; enforced by `AdminRoute`.


## Phase 3 continuation
- Added custom local SVG visual assets inspired by Jamshoro-style planned housing, plots, apartments and green belts.
- Added hero visual system and category imagery without external image dependencies.
- Fixed backend response-shape handling for property lists and property detail payloads.
- Added page SEO metadata for Home, Properties and Property Details.
- Added category-aware property image fallbacks.

- Removed reliance on Bootstrap JavaScript for the navbar account dropdown and FAQ accordion; both are now React-controlled.
