# Smart City Jamshoro — Roadmap Fix Report

This build updates the existing project without creating a new application.

## Implemented
- User/admin authentication hardening.
- ADMIN_EMAIL is reserved and cannot be used for public registration.
- Admin login is tied to the configured ADMIN_EMAIL and an admin database account.
- Forgot-password and reset-password flow with secure, expiring, single-use tokens.
- User profile picture upload endpoint.
- Real Buy Plot flow with predefined and custom requirements.
- CNIC, income, budget, plot size/type and contact details for authenticated plot requests.
- Admin plot-request workflow and status management.
- User ↔ Admin negotiation messages tied to an inquiry.
- Agreement/deal-completion workflow.
- Post-completion feedback.
- Configurable admin performance calculation between 2% and 5% based on positive feedback.
- Contact form moved to its own public contact API so guests can still contact the project team.
- 16 separate PNG property images copied to `frontend/public/property-images/`.
- Property cards can fall back to the matching local property image if a remote image URL fails.
- Local image-upload fallback when Cloudinary is not configured.
- Confirmed property price boundaries: Rs. 1,725,000 minimum residential plot and Rs. 7,500,000 maximum commercial plot.
- 14-acre / 180-plot project facts added to About.
- Team contact links made visible on the dark team background.
- Google Maps embed improved for normal interactive use.
- AI chatbot removed from the active frontend flow.
- AI chat route is no longer mounted by `app.js`.
- Mock-data messaging removed from the active authentication/property flow.
- Footer contains no social icons.

## Security
- `.env` files are excluded from the deliverable ZIP.
- `.git` is excluded from the deliverable ZIP.
- CNIC is not returned by default from inquiry list endpoints.
- CNIC is restricted to authorized inquiry detail access.
- Frontend role values are not trusted for registration.

## Validation
- All backend JavaScript files pass `node --check` syntax validation.
- Frontend dependency installation/build could not be completed in the build environment because `npm install` timed out, so a Vite production build is **not verified here**.

## Setup
1. Copy `backend/.env.example` to `backend/.env` and fill your real values.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run `npm install` inside both `backend` and `frontend`.
4. Run `npm run create-admin` inside `backend` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
5. Run `npm run seed` inside `backend` if you want to seed the 16 separate property images/listings.
6. Start backend with `npm run dev` and frontend with `npm run dev`.
