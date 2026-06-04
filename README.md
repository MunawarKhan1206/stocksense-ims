# StockSense IMS — Intelligent Inventory OS

> An enterprise-ready, production-grade SaaS inventory workspace for modern SMEs, engineered with Next.js 14, MongoDB Atlas, and a state-of-the-art UI system.

---

## ✨ Features

* **🎨 Modern Responsive UI System:** Tailored styling built on Tailwind CSS, `@base-ui/react` primitives, and fluid micro-animations powered by `framer-motion`.
* **🔍 Command Palette (Ctrl+K):** A lightning-fast, keyboard-driven navigation overlay and global catalog search powered by `cmdk`.
* **🔐 Secure Session Management:** Strict HttpOnly cookie-based sessions (NextAuth JWT strategy) with a 7-day session window and 1-hour sliding refresh rate.
* **🧱 Clean Layout Isolation:** Architectural route groups `(auth)`, `(public)`, and `(dashboard)` prevent sidebar/topbar shell leaks on public routes (`/login`, `/forbidden`, `/not-found`).
* **👥 Multi-Role Authorization (RBAC):** Server-side verification of roles (`super-admin`, `admin`, `inventory-staff`, `sales-staff`, `viewer`) controlling access dynamically.
* **🛒 Sales & Invoicing Ledger:** Real-time invoice registration, date-range filtering, and instant profit margin calculations.
* **📈 Rich Analytics & Reports:** Interactive charts (revenue velocities, product sales volumes, category weightings) built with Recharts, coupled with audit movement logs.
* **📬 Automated Low-Stock Notifications:** Instant warning badges and mock email dispatches integrated with the Resend API.

---

## 🛠️ Tech Stack

* **Core Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling & Components:** [Tailwind CSS](https://tailwindcss.com/) + [@base-ui/react](https://base-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **Database & ORM:** [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider & Google OAuth)
* **Charts:** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Toasts:** [Sonner](https://seed.run/)

---

## 📁 Project Structure

```text
├── app/
│   ├── (auth)/             # Auth layout group (Sidebar/Topbar-free)
│   │   └── login/          # Clean minimal login page
│   ├── (dashboard)/        # Dashboard layout group (Wraps components in AppShell)
│   │   ├── dashboard/      # Main KPI analytics panel
│   │   ├── products/       # Inventory catalog grid & search
│   │   ├── sales/          # Sales ledger & invoice management
│   │   ├── suppliers/      # Supplier contacts directory
│   │   ├── analytics/      # Financial statistics & audit trail
│   │   └── layout.js       # AppShell layout binding
│   ├── (public)/           # Public layout group (Sidebar/Topbar-free)
│   │   └── forbidden/      # 403 Forbidden template
│   ├── api/                # REST endpoints with server-side RBAC validation
│   ├── globals.css         # Styling system & Tailwind variables
│   ├── layout.js           # Root html/body layout & providers
│   └── not-found.js        # Global 404 handler (Bypasses AppShell)
├── components/
│   ├── dashboard/          # Analytics & Revenue charts
│   ├── layout/             # Sidebar, TopBar, CommandBar, AppShell
│   ├── ui/                 # Reusable primitive elements (Buttons, Tables, Avatars)
│   └── products/           # Catalog table list modals
├── lib/
│   ├── auth.js             # NextAuth strategies, JWT, and session rules
│   ├── mongodb.js          # Mongoose connection & db auto-migrations
│   └── apiUtils.js         # API middleware, RBAC checks, custom 403 payloads
└── models/                 # Database Schemas (User, Product, Sale, Supplier, Organization)
```

---

## 🚀 Getting Started

### 1. Prerequisite Setup

Cloning the repository and installing dependencies:

```bash
git clone https://github.com/MunawarKhan1206/stocksense-ims.git
cd stocksense-ims
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stocksense

# NextAuth Config
NEXTAUTH_SECRET=your_32_character_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth credentials (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend API setup for email logs (optional)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

### 3. Running the Workspaces

Start the local development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🔒 Production Verification & Building

Prior to deploying to production or staging environments, ensure all static code runs clean:

```bash
# Verify ESLint code quality rules
npm run lint

# Generate production bundle & static optimization
npm run build

# Start the compiled production build locally
npm run start
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more details.
