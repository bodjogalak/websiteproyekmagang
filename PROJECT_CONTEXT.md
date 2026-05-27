# PROJECT CONTEXT: Magang Portal (Monolith)

## 1. Tech Stack & Architecture
- **Type:** Monolith (Frontend + Backend in `app/`)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4 (configured via CSS Variables in `app/globals.css`)
- **Database:** MySQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials Provider)

## 2. Core Features Implemented
1.  **Role-Based Auth:**
    - **Middleware (`middleware.ts`):** Protects `/admin` routes. Checks `token.role`.
    - **Redirects:** Users -> `/dashboard`, Admins -> `/admin`.
2.  **Custom Design System:**
    - **Implementation:** Native CSS Variables inside `@theme` block in `globals.css`.
    - **Palette:** Overrides standard "blue" classes to use Custom Teal (`#1193b5`) and Gold (`#c3924d`).
3.  **Admin Panel:**
    - **Data Fetching:** Server Components fetch directly from Prisma.
    - **Interactivity:** Client Components (`ApplicationTable`) handle AJAX status updates.
    - **Logout:** Custom `LogoutButton.tsx` component with a modal (avoids default NextAuth confirmation page).
4.  **Application Process:**
    - User uploads PDF CV (stored in `/public/uploads`).
    - Status tracking (PENDING -> ACCEPTED/REJECTED).

## 3. Database Schema (Prisma)
- **User:** id, email, password, name, role (ADMIN/USER).
- **Application:** id, userId, fullName, campus, major, semester, cvUrl (nullable), status.

## 4. Key Components
- **`components/LogoutButton.tsx`**: Handles secure sign-out with a confirmation popup.
- **`middleware.ts`**: Root-level security guard for protected routes.
- **`app/api/application`**: API routes handling form submissions and file uploads.

## 5. Migration Notes (If splitting Frontend/Backend)
- **Current State:** API routes (`app/api/`) handle logic.
- **To Migrate:** Move logic from `app/api/` to Express/Python. Keep Prisma Schema.