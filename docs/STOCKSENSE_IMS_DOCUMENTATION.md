# StockSense IMS — Enterprise Inventory SaaS
### Production-Grade Multi-Tenant Inventory Management Platform

---

## 1. Project Name & Version

**StockSense IMS** — v1.0 (Production-Ready SaaS Core)

---

## 2. Business Positioning

### Who Is This For?

StockSense IMS is designed for:

- **Small & Medium Businesses (SMBs)** managing physical product inventory across one or multiple locations.
- **Retail Stores** that need real-time stock tracking, automated low-stock alerts, and supplier communication.
- **Warehouses & Distributors** requiring multi-user role control and audit-grade activity history.
- **Multi-branch Businesses** that need isolated, organization-scoped workspaces under a single platform.

---

### What Problem Does It Solve?

Most small businesses still manage inventory using:

| Legacy Method | Problem |
|:---|:---|
| Excel spreadsheets | No real-time updates, zero automation |
| Paper-based POS | No data visibility, error-prone |
| Generic accounting tools | Not built for stock tracking or supplier coordination |
| Single-user desktop software | Cannot scale to multi-user or multi-branch usage |

StockSense IMS replaces all of these with a unified, cloud-hosted, role-secured SaaS platform.

---

### Why StockSense IMS?

| Capability | Traditional Tools | StockSense IMS |
|:---|:---:|:---:|
| Real-time stock tracking | ❌ | ✅ |
| Automated supplier emails | ❌ | ✅ |
| Multi-user role permissions | ❌ | ✅ |
| Multi-tenant (multi-business) | ❌ | ✅ |
| Dashboard analytics | ❌ | ✅ |
| Email delivery audit logs | ❌ | ✅ |
| Low margin & dead stock detection | ❌ | ✅ |
| Hosted & scalable | ❌ | ✅ |

---

## 3. Objective

StockSense IMS is a production-ready, cloud-native multi-tenant Inventory Management System built to automate stock monitoring, streamline supplier restock coordination, and deliver real-time business intelligence across multiple business workspaces on a single secure platform.

---

## 4. Simple Data Flow (Non-Technical Overview)

The following explains the complete system cycle in plain English:

```
SALE RECORDED
     ↓
Stock automatically deducted from inventory
     ↓
System checks each product's safety threshold
     ↓
Products below threshold are flagged as "Low Stock"
     ↓
Low-stock items are grouped by their assigned supplier
     ↓
One consolidated Restock Order email sent per supplier
     ↓
Email delivery result is saved to the Email Observability Log
     ↓
Admin can view logs, filter by status, and retry failed emails
```

This entire cycle is automated, non-blocking, and requires zero manual intervention.

---

## 5. System Architecture

StockSense IMS uses a modern full-stack JavaScript architecture optimized for cloud deployment:

```
Client Browser
     ↓  (NextAuth session token)
Middleware Guard  →  redirects unauthorized users
     ↓
Next.js App Router (Pages + API Route Handlers)
     ↓
MongoDB (Mongoose ODM)  ←→  organizationId-scoped queries
     ↓
Email Observability System  →  Resend / SMTP provider
```

### Technology Stack

| Layer | Technology |
|:---|:---|
| Framework | Next.js 14 (App Router) |
| Runtime | Node.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | NextAuth.js (Credentials + Google OAuth) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Email Delivery | Resend (primary), Nodemailer (fallback) |
| Hosting Target | Vercel + MongoDB Atlas |

---

## 6. Core Features

### 🔒 Multi-Tenant Architecture

Every record in the database (Products, Sales, Suppliers, Users, Email Logs, Stock Movements) is tagged with an `organizationId`. No query can return data outside the authenticated user's organization.

- **Read operations** use `getOrgFilter(req, session)` to inject the `organizationId` condition automatically.
- **Write operations** use `getOrgForWrite(req, session)` to tag every new record correctly.
- `super-admin` users may optionally pass a custom `x-organization-id` header to inspect cross-tenant data for platform management purposes.

---

### 👥 Role-Based Access Control (RBAC)

| Role | Scope | Key Permissions |
|:---|:---|:---|
| `super-admin` | Platform-wide | Access all organizations, manage users, view global analytics and email logs |
| `admin` | Single organization | Full inventory + sales control, manage staff, view and retry Email Observability Logs |
| `inventory-staff` | Single organization | View and update stock, create inbound movements — no delete or sales access |
| `sales-staff` | Single organization | Record sales invoices, view product availability — no inventory modification |
| `viewer` | Single organization | Read-only: view dashboards, charts, and reports only |

RBAC is enforced at three layers: **middleware route guard**, **API controller role verification**, and **UI conditional rendering** (restricted action buttons are never rendered for unauthorized roles).

---

### 📦 Automated Supplier Email System

When a sale causes stock to drop below a product's safety threshold:

1. All affected products are grouped by their assigned supplier.
2. A single **Consolidated Restock Order email** is sent to each supplier — not one email per product.
3. Each email contains a full table of affected products including:
   - Product name and SKU
   - Current stock level
   - Safety threshold
   - **Suggested Order Quantity (SOQ)**

**SOQ Formula:**
```
SOQ = (Threshold × 2) - Current Stock
```

Example: If threshold is 10 and current stock is 3 → SOQ = 17 units.

All email operations are executed **asynchronously** — they never block or slow down the sales API response.

---

### 📊 Stock Intelligence Engine

| Metric | Logic | Purpose |
|:---|:---|:---|
| 🔥 **Fast-Moving Products** | Items with >20% of total 30-day sales volume | Identify high-demand SKUs |
| ⚠ **Low Margin Alerts** | `(price - costPrice) / price < 0.15` | Detect underpriced or high-cost products |
| 💤 **Dead Stock Warning** | Products with stock > 0 but zero sales in last 30 days | Flag tied-up capital |
| 🏥 **Stock Health %** | `(products above threshold / total products) × 100` | Overall inventory health score |
| 📈 **Restock Suggestions** | Automatic SOQ calculation for all low-stock items | Procurement planning |

---

### 📧 Email Observability System

Available at `/analytics/email-logs`. Accessible by `admin` and `super-admin` roles.

Features:
- View full history of all automated supplier emails.
- Filter by **Delivery Status** (`sent`, `failed`) and by **Supplier**.
- View error details for failed deliveries (e.g., SMTP timeout, invalid MX record).
- **Manual Resend button** — re-triggers a restock email for any individual product log entry using live catalog values.
- All email events are persisted in the `EmailLog` collection with status, timestamp, recipient, product reference, and error message (if any).

---

## 7. Dashboard — Business Intelligence Layer

The main workspace dashboard provides a full business intelligence view:

### KPI Cards (6 Metrics)
1. **Stock Health %** — percentage of products above safety threshold
2. **Total Products** — active catalog count (archived excluded)
3. **Low Stock Alerts** — items at or below threshold
4. **Low Margin Alerts** — items with gross margin below 15%
5. **Total Revenue** — cumulative sales revenue
6. **Total Profit** — cumulative net profit

### Charts
- **Monthly Revenue & Profit** — 6-month line/bar chart
- **Top Products by Sales Volume** — bar chart
- **Stock by Category** — pie chart

### Operational Intelligence Columns
| Column | Description |
|:---|:---|
| Fast Moving Items | Top products by 30-day sales share |
| Dead Stock Warning | Items with no sales in 30 days |
| Low Margin Alerts | Items below 15% profit margin |
| Top Supplier Partners | Suppliers ranked by inventory value |
| Recent Stock Activity | Live feed of stock movements |

All charts and widgets are fully responsive across mobile and desktop viewports.

---

## 8. Security Model

| Layer | Mechanism |
|:---|:---|
| Authentication | NextAuth.js JWT session tokens |
| Route Protection | Next.js Middleware (RBAC-based redirects) |
| API Protection | Session validation on every route handler |
| Data Isolation | `organizationId` filter on every database query |
| Error Responses | Clean JSON errors only — no stack traces exposed |
| Input Validation | Structured schema validation before all write operations |

---

## 9. Folder Structure

```
stocksense-ims/
├── app/
│   ├── api/            → Next.js API route handlers
│   ├── dashboard/      → Main workspace UI
│   ├── products/       → Inventory management UI
│   ├── sales/          → Sales ledger UI
│   ├── suppliers/      → Supplier management UI
│   └── analytics/      → Reports + Email Observability Logs UI
├── components/         → Reusable UI widgets and layout
├── lib/
│   ├── apiUtils.js     → RBAC + session helpers
│   ├── auth.js         → NextAuth configuration
│   ├── emailService.js → Grouped restock email engine
│   ├── mailer.js       → Admin low-stock alert emails
│   └── mongodb.js      → Database connection + migrations
├── models/             → Mongoose schemas
├── middleware.js        → Route-level RBAC guard
└── seed.js             → Database seeder for testing
```

---

## 10. Deployment Configuration

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/stocksense

# Authentication
NEXTAUTH_SECRET=your-randomly-generated-secret
NEXTAUTH_URL=https://your-production-domain.com

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### Build Verification

```bash
npm run build      # Must pass with zero errors before deployment
node seed.js       # Optional: populate test data
npm run start      # Serve the production build locally
```

---

## 11. Database Seeding & Testing

A comprehensive seeder script (`seed.js`) is included to populate a clean multi-tenant database for full end-to-end flow testing.

### Run the Seeder
```bash
node seed.js
```

### Test Users

Credentials should be configured locally using the seed script or secure admin onboarding. Do not store plaintext passwords in documentation.

| Role | Email | Tenant | Access Level |
|:---|:---|:---|:---|
| Super Admin | `superadmin@stocksense.com` | All organizations | Full platform access |
| Org Admin | `admin@alpha.com` | Alpha Retailers | Full org control |
| Inventory Staff | `stock@alpha.com` | Alpha Retailers | Stock management only |
| Sales Cashier | `sales@alpha.com` | Alpha Retailers | Invoice creation only |
| Viewer / Auditor | `viewer@alpha.com` | Alpha Retailers | Read-only access |
| Org Admin | `admin@beta.com` | Beta Logistics | Isolated workspace |

### Pre-Seeded Test Scenarios

The seeder deliberately creates these scenarios for testing:

| Scenario | Product | Expected Behavior |
|:---|:---|:---|
| Low Stock Alert | Super LED Smart TV 43" | Restock email trigger on next sale |
| Low Margin Warning | Classic Men Denim Shirt | Appears in Low Margin Alerts dashboard widget |
| Out of Stock | Organic Green Tea | Critical badge, SOQ calculated |
| Dead Stock | Winter Woolen Cap | Appears in Dead Stock column — no recent sales |
| Failed Email Log | Green Tea email | Shows "Failed" in Email Observability Log with retry button |
| Tenant Isolation | Beta Logistics products | Invisible to all Alpha Retailers users |

---

## 12. ⚠ Production Considerations

The following items are known limitations at the current stage. They do not block deployment for small-to-medium scale, but should be addressed before enterprise-scale usage.

### Email Provider

The system currently uses **Nodemailer** with configurable SMTP transport. For production deployment, **Resend** is the recommended email provider.

- Resend offers superior deliverability over raw Gmail SMTP.
- Eliminates Gmail rate-limiting and self-signed certificate issues.
- Simple API key integration replaces SMTP credentials.
- To configure: set `RESEND_API_KEY` and update the transporter in `lib/emailService.js`.

### Background Processing

Email triggers are currently executed **asynchronously inline** within the Sales API handler using non-blocking `.catch()` chains. This is safe for low-to-medium traffic.

> **Recommendation for scale**: Move email dispatch to a background job queue (e.g., BullMQ with Redis) to fully decouple email processing from the web request lifecycle.

### Rate Limiting

The API routes currently have no rate limiting applied. This creates risk of:
- Intentional or accidental email flooding via `/api/email-logs/retry`.
- Brute-force login attempts.

> **Recommendation**: Implement API rate limiting using `next-rate-limit` or a Vercel Edge middleware layer before public launch.

### Database Indexes

Multi-tenant query performance depends on `organizationId` being indexed across all collections. Mongoose schemas reference this field, but compound indexes for high-traffic query patterns (e.g., `{ organizationId, isArchived, stock }`) should be added for scale.

---

## 13. Future Enhancements

| Feature | Description | Priority |
|:---|:---|:---:|
| Resend Integration | Replace Nodemailer with Resend API | 🔴 High |
| Rate Limiting | Protect API routes from abuse | 🔴 High |
| Job Queue (BullMQ) | Decouple email from request lifecycle | 🟡 Medium |
| Barcode Scanner Integration | Mobile-friendly stock intake | 🟡 Medium |
| Subscription Billing | SaaS monetization via Stripe | 🟡 Medium |
| AI Demand Forecasting | Predict restock needs from velocity | 🟢 Low |
| Mobile Application | React Native companion app | 🟢 Low |
| Warehouse Multi-Location | Track stock across physical locations | 🟢 Low |

---

## 🧠 System Classification

| Classification | Status |
|:---|:---:|
| MVP (Proof of Concept) | ❌ Surpassed |
| **Production-Ready SaaS Core** | ✅ **Current Stage** |
| Enterprise Scale Ready | ⚠ Requires job queue + Resend integration |

### What "Production-Ready SaaS Core" means:

- ✅ Multi-tenant data isolation enforced
- ✅ RBAC implemented at middleware, API, and UI layers
- ✅ Automated supplier email system with grouped consolidation
- ✅ Email Observability System with retry capability
- ✅ Business intelligence dashboard with live KPIs
- ✅ Mobile-first responsive UI
- ✅ Skeleton loaders and loading states throughout
- ✅ `npm run build` passes with zero compilation errors
- ✅ Seed data available for full flow testing
- ⚠ Rate limiting not yet implemented
- ⚠ Email processing is inline (not queued)

---

*Documentation maintained by the StockSense IMS engineering team.*
*Last updated: May 2026*
