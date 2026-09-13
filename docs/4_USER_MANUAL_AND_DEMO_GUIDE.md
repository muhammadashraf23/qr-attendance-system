# User Manual & Live Demo Strategy Guide
## Project: Attendzo — College & University SaaS Platform (Approach 2)
## Project: Attendzo — College & University Attendance System

---

## 1. End-to-End User Manual
## 1. Approach 2 User Manual

### 1.1 Unified Role Registration (`/register`)
### 1.1 Role Registration (`/register`)
1. Open `/register` in browser.
2. Select your role using top tabs:
   - 🏫 **Institution Dean**: Register University profile & campus GPS center.
   - 👨‍🏫 **Teacher / Faculty**: Register Teacher ID, Department, and Assigned Subjects.
   - 🎓 **Student**: Register Roll Number / ID, Branch, and Face Biometric descriptor.
   - 🎓 **Student**: Register Roll Number / ID, Branch, and Face descriptor.
3. Click **Complete Registration**.
### 1.1 Faculty CSV Roster Import (`/admin/roster-import`)

### 1.2 Faculty CSV Roster Import (`/admin/roster-import`)
1. Open `/admin/roster-import` in browser.
2. Drag and drop your department CSV file or click **Import Sample Class Roster**.
3. System instantly populates student records for your class.

### 1.2 Teacher Subject Lecture QR Generator (`/teacher/lecture-qr`)
1. Open `/teacher/lecture-qr` on faculty device.
2. Select active course/subject (e.g. `CS101 - Algorithms & Data Structures`).
3. Click **Start CS101 Lecture Session**.
4. Project the live dynamic QR Code on the classroom projector screen. View real-time student check-ins.
### 1.2 1-Click Student Face Activation (`/activate-face`)
### 1.3 Student Face Activation (`/activate-face`)
1. Open `/activate-face` on student smartphone or tablet.
2. Enter your Roll Number / ID (e.g. `CS-2026-001`).
3. Confirm identity: *"Welcome, Alexander Vance"*.
4. Snap a 3-second camera selfie to activate Face ID. Done!
4. Snap a camera selfie to activate Face ID. Done!

### 1.3 Student Kiosk Check-In (`/attend`)
### 1.4 Teacher Subject Lecture QR Generator (`/teacher/lecture-qr`)
1. Open `/teacher/lecture-qr` on faculty device.
2. Select active course/subject (e.g. `CS101 - Algorithms & Data Structures`).
3. Click **Start CS101 Lecture Session**.
4. Project the live dynamic QR Code on the classroom screen. View real-time student check-ins.

### 1.5 Student Kiosk Check-In (`/attend`)
1. Open `/attend` on smartphone or classroom tablet.
2. Enter Student Roll Number or use **Face Recognition Mode**.
3. System verifies campus GPS bounds and logs attendance for the active subject session.
### 1.3 Teacher Lecture QR & Student Attendance (`/teacher/lecture-qr` & `/attend`)
1. Teacher projects active lecture QR code for `CS101 Algorithms`.
2. Student scans QR or uses Face AI at `/attend`. System validates campus GPS bounds and logs attendance.

---

## 2. 10-Minute Presentation & Live Demo Playbook

```
┌─────────────────────────────────────────────────────────────────────────┐
│            10-MINUTE ATTENDZO LIVE DEMO PLAYBOOK (30 MARKS)             │
├─────────────────┬───────────────────────────────────────────────────────┤
│ Minute 1 - 2    │ Educational SaaS Concept & Unified /register Portal   │
│ Minute 3 - 5    │ Teacher Subject Lecture QR Generator (/teacher/qr)    │
│ Minute 6 - 7    │ Student Check-in (QR + Campus GPS + Face AI)          │
│ Minute 8 - 10   │ Subject Defaulters (<75% Rule), Excel Register Export  │
│ Minute 1 - 2    │ College SaaS Concept & Approach 2 Overview            │
│ Minute 3 - 4    │ CSV Roster Import (/admin/roster-import) Demo         │
│ Minute 5 - 6    │ 1-Click Student Face Activation (/activate-face) Demo│
│ Minute 7 - 10   │ Teacher Lecture QR (/teacher/qr) & Defaulter Report   │
│ Minute 1 - 2    │ System Overview & Role Registration (/register)       │
│ Minute 3 - 4    │ CSV Class Roster Import (/admin/roster-import)        │
│ Minute 5 - 6    │ Student Face Activation (/activate-face) Demo         │
│ Minute 7 - 8    │ Teacher Lecture QR (/teacher/lecture-qr) & Kiosk      │
│ Minute 9 - 10   │ Defaulter Analytics (<75% Rule) & Excel Export        │
└─────────────────┴───────────────────────────────────────────────────────┘
```
