# Project Documentation Suite
## Attendzo — College & University SaaS Platform (Approach 2)

Welcome to the official documentation package for **Attendzo**. This folder contains all academic and technical submission deliverables required for evaluation (30 Marks total: 20 Coding + Idea, 10 Documentation).

---

## Documentation Index

| File | Document Title | Description | Target Evaluation |
|---|---|---|---|
| 📄 [`1_SRS_DOCUMENT.md`](file:///e:/Projects/qr-attendance-system/docs/1_SRS_DOCUMENT.md) | **SRS & Educational SaaS Architecture** | Unified `/register` portal, Option B Subject-Wise Lecture QR, subscription tiers, decoupled system architecture, DFD diagrams. | SRS & System Design (2.5 Marks) |
| 📄 [`2_DATABASE_AND_SCHEMA.md`](file:///e:/Projects/qr-attendance-system/docs/2_DATABASE_AND_SCHEMA.md) | **Database & Schema Documentation** | Complete Mermaid Entity-Relationship Diagram (ERD), multi-tenant schemas, field data dictionary, `UNIQUE(roll_number, subject_code, date)` constraint. | ERD & Data Dictionary (2.5 Marks) |
| 📄 [`3_API_AND_TECHNICAL_MANUAL.md`](file:///e:/Projects/qr-attendance-system/docs/3_API_AND_TECHNICAL_MANUAL.md) | **API & SaaS Technical Manual** | Comprehensive REST API endpoints, Haversine GPS geofencing formula, Face AI embedding math, and **75% Subject Defaulter Percentage Math**. | Technical Manual & API Docs (2.5 Marks) |
| 📄 [`4_USER_MANUAL_AND_DEMO_GUIDE.md`](file:///e:/Projects/qr-attendance-system/docs/4_USER_MANUAL_AND_DEMO_GUIDE.md) | **User Manual & Live Demo Strategy Guide** | End-to-end registration & Teacher Lecture QR user manuals + minute-by-minute 10-minute presentation playbook. | User Manual & Demo Strategy (2.5 Marks) |
| 📄 [`1_SRS_DOCUMENT.md`](file:///e:/Projects/qr-attendance-system/docs/1_SRS_DOCUMENT.md) | **SRS & Educational SaaS Architecture** | Approach 2 CSV Roster Import, 1-Click Face Activation, Option B Subject QR, subscription tiers, DFD diagrams. | SRS & System Design (2.5 Marks) |
| 📄 [`2_DATABASE_AND_SCHEMA.md`](file:///e:/Projects/qr-attendance-system/docs/2_DATABASE_AND_SCHEMA.md) | **Database & Schema Documentation** | Complete Mermaid Entity-Relationship Diagram (ERD), multi-tenant schemas, field data dictionary, `students` activation status. | ERD & Data Dictionary (2.5 Marks) |
| 📄 [`3_API_AND_TECHNICAL_MANUAL.md`](file:///e:/Projects/qr-attendance-system/docs/3_API_AND_TECHNICAL_MANUAL.md) | **API & SaaS Technical Manual** | Comprehensive REST API endpoints, Haversine GPS geofencing formula, Face AI embedding math, and **75% Defaulter Math**. | Technical Manual & API Docs (2.5 Marks) |
| 📄 [`4_USER_MANUAL_AND_DEMO_GUIDE.md`](file:///e:/Projects/qr-attendance-system/docs/4_USER_MANUAL_AND_DEMO_GUIDE.md) | **User Manual & Live Demo Strategy Guide** | CSV Roster Import & 1-Click Face Activation User Manuals + minute-by-minute 10-minute presentation playbook. | User Manual & Demo Strategy (2.5 Marks) |
| 📄 [`5_TEAM_TASK_BREAKDOWN.md`](file:///e:/Projects/qr-attendance-system/docs/5_TEAM_TASK_BREAKDOWN.md) | **Team Task Breakdown & Group Deliverables** | 3-member group responsibility matrix (Muhammad Ashraf, Shehzad Nisar, Muhammad Umer Kamran), technical deliverables mapping, and marks rubric correlation. | Team Task Distribution |
| 📄 [`DEPLOYMENT.md`](file:///e:/Projects/qr-attendance-system/docs/DEPLOYMENT.md) | **Production Deployment Guide** | Step-by-step production deployment manual for Vercel (Frontend), Render (Backend), and MongoDB Atlas / Supabase. | Production Setup |

---

## Key Workflows & Pages
1. 🔐 **[`/register`](file:///e:/Projects/qr-attendance-system/frontend/src/app/register/page.jsx)** — Unified Role-Based Registration Portal (Institution Dean, Teacher/Faculty, Student).
2. 👨‍🏫 **[`/teacher/lecture-qr`](file:///e:/Projects/qr-attendance-system/frontend/src/app/teacher/lecture-qr/page.jsx)** — Option B Teacher Subject-Wise Lecture QR Code Generator & Live Classroom Feed.
3. 📱 **[`/attend`](file:///e:/Projects/qr-attendance-system/frontend/src/app/attend/page.jsx)** — Student Touchless Attendance Kiosk (Campus GPS + Face AI).
4. 📊 **[`/admin/dashboard`](file:///e:/Projects/qr-attendance-system/frontend/src/app/admin/dashboard/page.jsx)** — Academic Analytics & Defaulters (<75% attendance rule).
## Key Approach 2 Pages
1. 📊 **[`/admin/roster-import`](file:///e:/Projects/qr-attendance-system/frontend/src/app/admin/roster-import/page.jsx)** — CSV Class Roster Import Engine (Drag & drop or Quick Sample Roster).
2. 📸 **[`/activate-face`](file:///e:/Projects/qr-attendance-system/frontend/src/app/activate-face/page.jsx)** — 1-Click Student Face Activation Portal (Roll No lookup + 3-sec Selfie).
3. 👨‍🏫 **[`/teacher/lecture-qr`](file:///e:/Projects/qr-attendance-system/frontend/src/app/teacher/lecture-qr/page.jsx)** — Teacher Subject-Wise Lecture QR Generator.
4. 📱 **[`/attend`](file:///e:/Projects/qr-attendance-system/frontend/src/app/attend/page.jsx)** — Student Touchless Attendance Kiosk (Campus GPS + Face AI).
5. 📈 **[`/admin/dashboard`](file:///e:/Projects/qr-attendance-system/frontend/src/app/admin/dashboard/page.jsx)** — Academic Analytics & Defaulters (<75% attendance rule).
