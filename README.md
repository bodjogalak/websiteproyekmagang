# Portal Magang (Internship Portal)

A full-stack web application for managing internship applications at Dinas Kominfo. Built as a Monolith using Next.js 14.

## 🚀 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (Role-Based: User vs Admin)
- **Styling:** Tailwind CSS v4 (Custom "Government Teal" Theme)

## 🛠️ Features
### 1. Public Facing
- **Landing Page:** Professional homepage with sticky navbar and call-to-action sections.
- **Authentication:** Secure Login/Register forms with role redirection.

### 2. User (Applicant)
- **Dashboard:** View application status (Pending/Accepted/Rejected).
- **Profile:** Manage personal details and upload CV (PDF).

### 3. Admin (Staff)
- **Admin Panel:** Table view of all applicants.
- **Actions:** One-click "Accept" or "Reject" buttons.
- **Review:** Download and view applicant CVs.
- **Security:** Custom Logout Modal with confirmation to prevent accidental sign-outs.

## 🎨 Design System
The app uses a custom color palette defined in `app/globals.css`:
- **Primary (Teal):** `#1193b5` (Buttons, Navbar)
- **Secondary (Light Blue):** `#95ddeb` (Backgrounds)
- **Accent (Gold):** `#c3924d` (Highlights)

## ⚙️ Installation & Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Setup Environment**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="mysql://root:@localhost:3306/web-info-magang"
    NEXTAUTH_SECRET="rahasia_negara_dinas_kominfo_2026_super_secure"
    NEXTAUTH_URL="http://localhost:3000"
    ```

3.  **Setup Database**
    Ensure MySQL is running (e.g., via Laragon/XAMPP), then sync the schema:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`

## 👤 Default Accounts
* **User:** Register manually via `/register`.
* **Admin:** Register a normal user, then manually change their `role` to `'ADMIN'` in your database (via HeidiSQL/PhpMyAdmin).