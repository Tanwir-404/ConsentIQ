# 🛡️ ConsentIQ — Cyber Consent Management System

---

## 📌 About

**ConsentIQ** is a full-stack Cyber Consent Management System that enables organizations to securely collect, store, manage, and enforce user consent throughout its entire lifecycle.

It ensures personal data is accessed or processed **only after validating the user's consent** — fully aligned with **GDPR** and **CCPA** data protection regulations.

---

## 🚀 Features

### 🔴 Admin Dashboard
- 📊 Live overview with real-time stats
- 🔒 Consent Logic Engine — shows data access ALLOWED vs BLOCKED
- 📄 Policy management — create and delete policies
- 🤝 Agreement management — link agreements to policies
- 👥 User management — add and manage users
- ✅ Consent records — Toggle, Revoke and Delete consent
- 📋 Audit log — complete activity trail for compliance
- ⚡ Realtime updates — dashboard updates without refreshing

### 🔵 User Privacy Portal
- 🏠 Personal dashboard with data access status
- ⚙️ Privacy Preference Center — Accept, Deny or Revoke consent
- 📋 Full consent history
- 🔒 GDPR & CCPA rights information displayed

---

## 🔐 Login Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@consentiq.com    | Admin@123  |
| User  | any email in User table | User@123  |

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14, React, TypeScript       |
| Styling      | Tailwind CSS                        |
| Database     | Supabase (PostgreSQL)               |
| Realtime     | Supabase Realtime (WebSockets)      |
| Charts       | Recharts                            |
| Icons        | Lucide React                        |

---

## 🗄️ Database Schema
```
User
├── id (uuid, PK)
├── name (text)
├── email (text)
├── avatar_url (text)
└── created_at (timestamp)

Policy
├── policy_id (uuid, PK)
├── policy_name (text)
└── created_at (timestamp)

Agreement
├── agreement_id (uuid, PK)
├── policy_id (uuid, FK → Policy)
├── agreement_name (text)
└── created_at (timestamp)

Consent_Record
├── consent_id (uuid, PK)
├── user_id (uuid, FK → User)
├── agreement_id (uuid, FK → Agreement)
├── consent_status (text) — "Opt-in" or "Opt-out"
└── created_at (timestamp)

audit_log
├── id (uuid, PK)
├── action (text)
├── user_email (text)
├── details (text)
├── entity_id (uuid)
└── created_at (timestamp)
```

### Relationships
```
Policy ──< Agreement ──< Consent_Record >── User
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account

### 1. Clone the repository
```bash
git clone https://github.com/Tanwir-404/consentiq.git
cd consentiq
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local` file
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-public-key
```

### 4. Set up the database
Run the SQL from `SETUP_GUIDE.md` in your Supabase SQL Editor.

### 5. Run the project
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure
```
consentiq/
├── app/
│   ├── login/
│   │   └── page.tsx              ← Login page (Admin + User)
│   ├── dashboard/                ← Admin pages
│   │   ├── overview/page.tsx     ← Live dashboard
│   │   ├── policies/page.tsx     ← Policy management
│   │   ├── agreements/page.tsx   ← Agreement management
│   │   ├── users/page.tsx        ← User management
│   │   ├── consent/page.tsx      ← Consent records
│   │   └── audit/page.tsx        ← Audit log
│   └── portal/                   ← User Privacy Portal
│       ├── home/page.tsx         ← User dashboard
│       ├── preferences/page.tsx  ← Privacy Preference Center
│       └── history/page.tsx      ← Consent history
├── components/
│   ├── AdminSidebar.tsx          ← Admin navigation
│   └── UserSidebar.tsx           ← User navigation
├── lib/
│   └── supabase.ts               ← Supabase client
├── ConsentIQ-Backup.html         ← Offline demo
└── .env.local.example            ← Environment template
```

---

## 🏗️ System Architecture
```
User / Admin
     ↓
Login Page (Role-based routing)
     ↓
┌─────────────────┬─────────────────────┐
│  Admin Dashboard │  User Privacy Portal │
│  ─────────────  │  ─────────────────  │
│  Policies        │  Preference Center  │
│  Agreements      │  Consent History    │
│  Users           │  Data Access Status │
│  Consent Records │                     │
│  Audit Log       │                     │
└─────────────────┴─────────────────────┘
          ↓
   Supabase (PostgreSQL)
   + Realtime WebSockets
```

---

## 📋 Modules

### 1. User Consent Management Module
Allows users to give, deny, modify and revoke consent preferences for data usage through the Privacy Preference Center.

### 2. Consent Logic & Validation Module
Validates user consent based on policy rules. Ensures data processing happens only when permission is granted. Shows ALLOWED or BLOCKED status for each data category.

### 3. Integration & Enforcement Module
Connects with organizational systems through APIs and enforces consent decisions. Records all enforcement actions in the audit log for compliance.

---

## 🌐 Deployment

Deploy to Vercel for free:

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Connect your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
5. Click Deploy ✅

---


---

## 📚 References

1. GDPR Official Guidelines — [gdpr-info.eu](https://gdpr-info.eu)
2. TrustArc — What is Consent Management? — [trustarc.com](https://trustarc.com/consent-management-guide/)
3. Usercentrics — Consent Management & Compliance — [usercentrics.com](https://usercentrics.com/consent-management-compliance/)
4. IAPP — Privacy Engineering Best Practices — [iapp.org](https://iapp.org/resources/article/privacy-engineering-best-practices/)

---

## 📄 License

This project is built for educational purposes as part of CCD 334 Mini Project.
