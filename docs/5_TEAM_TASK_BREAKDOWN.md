# Team Task Breakdown & Group Deliverables
## Project: Attendzo — Educational SaaS Platform
## Project: Attendzo — College & University SaaS Platform

---

## 1. Group Structure & Role Distribution (4 Members)

```
 ┌─────────────────────────────────────────────────────────────────┐
 │               MEMBER 1: SaaS Lead & Backend Arch                │
 │  • Express REST API, Multi-tenancy, JWT RBAC, Defaulter Engine │
 └─────────────────────────────────────────────────────────────────┘
                                   │
 ┌─────────────────────────────────┴───────────────────────────────┐
 │                                                                 │
 ▼                                                                 ▼
┌─────────────────────────────────┐       ┌────────────────────────────────┐
│   MEMBER 2: Frontend & UI/UX    │       │ MEMBER 3: AI & PWA Feature Dev │
│ • Next.js 14 Unified Portal,    │       │ • Teacher Lecture QR Engine,   │
│   Recharts Dashboard, Tailwind  │       │   Face-api.js ML Kiosk, GPS    │
│ • Next.js 14 CSV Roster Import, │       │ • Teacher Lecture QR Engine,   │
│   1-Click Face Activation Portal│       │   Face-api.js ML Kiosk, GPS    │
└─────────────────────────────────┘       └────────────────────────────────┘
                                   │
                                   ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │            MEMBER 4: System Integration & Documentation         │
 │ • SRS, ERD, API Manuals, User Manual, Live Demo Script, QA     │
 └─────────────────────────────────────────────────────────────────┘
```

---

## 2. Evaluation Rubric & Marks Mapping (30/30 Marks)

| Pillar | Marks | Implementation Proof | Member Ownership |
|---|---|---|---|
| **1. Multi-Tenant Educational SaaS** | 4 Marks | Unified Role Registration (`/register`), institution workspace setup, and campus settings. | Member 1 & Member 2 |
| **2. Subject-Wise Lecture QR (Option B)** | 4 Marks | Teacher Lecture QR Generator (`/teacher/lecture-qr`) with countdown session timer & real-time feed. | Member 3 |
| **1. Multi-Tenant Educational SaaS** | 4 Marks | CSV Roster Import (`/admin/roster-import`) and 1-Click Face Activation (`/activate-face`). | Member 1 & Member 2 |
| **2. Subject-Wise Lecture QR (Option B)** | 4 Marks | Teacher Lecture QR Generator (`/teacher/lecture-qr`) with countdown session timer & live feed. | Member 3 |
| **3. Touchless Kiosk & Geofencing** | 4 Marks | Student Kiosk (`/attend`) with server-validated Haversine campus GPS coordinates. | Member 3 |
| **4. Academic Defaulter Analytics** | 4 Marks | Real-time student attendance % computation per subject, defaulter alerts (<75% exam eligibility rule), Excel export. | Member 1 & Member 2 |
| **5. Code Quality & Security** | 4 Marks | bcrypt hashing, JWT token auth, rate limiters, Helmet HTTP security headers. | Member 1 & Member 2 |
