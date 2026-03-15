# 🛡️ ConsentIQ — Cyber Consent Management System

A full-stack consent management system with **Admin Dashboard** and **User Privacy Portal**.
Built as CCD 334 Mini Project — Group 05.

---

## 🚀 Features

### Admin Dashboard
- 📊 Live overview with Consent Logic Engine status
- 📄 Policy management
- 🤝 Agreement management
- 👥 User management
- ✅ Consent records with Toggle & Revoke
- 📋 Audit log for GDPR/CCPA compliance
- 🔴 Real-time updates

### User Privacy Portal
- 🏠 Personal dashboard with data access status
- ⚙️ Privacy Preference Center — Accept / Deny / Revoke consent
- 📋 Full consent history
- 🔒 GDPR & CCPA rights information

---

## 🔐 Login Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@consentiq.com | Admin@123 |
| User  | user@consentiq.com  | User@123  |
| User  | david@consentiq.com | User@123  |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| Charts | Recharts |
| Icons | Lucide React |

---

## ⚙️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key

# 3. Run
npm run dev
```

See SETUP_GUIDE.md for complete database setup SQL.

---

## 📁 Structure

```
app/
├── login/page.tsx              ← Dual login (Admin + User)
├── dashboard/                  ← Admin pages
│   ├── overview/page.tsx
│   ├── policies/page.tsx
│   ├── agreements/page.tsx
│   ├── users/page.tsx
│   ├── consent/page.tsx
│   └── audit/page.tsx
└── portal/                     ← User Privacy Center
    ├── home/page.tsx
    ├── preferences/page.tsx    ← Accept/Deny/Revoke consent
    └── history/page.tsx
components/
├── AdminSidebar.tsx
└── UserSidebar.tsx
ConsentIQ-Backup.html           ← Offline demo (double-click to open)
```

---

**Group No. 05 | CCD 334 Mini Project | 2023–2027 Batch**
