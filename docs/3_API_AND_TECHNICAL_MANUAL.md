# API & SaaS Technical Manual
## Project: Attendzo — Educational SaaS Platform
## Project: Attendzo — College & University SaaS Platform

---

## 1. RESTful API Endpoint Reference
## 1. RESTful API Endpoint Reference (Approach 2)

### 1.1 Authentication & Unified Onboarding (`/api/auth`)
### 1.1 Faculty CSV Roster Import Endpoints

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register-institution` | `{ institution_name, admin_name, email, password, office_lat, office_lng }` | Institution onboarding. |
| `POST` | `/api/employees` | `{ employee_id, name, email, department_name, designation }` | Teacher / Student registration. |
| `POST` | `/api/auth/login` | `{ identifier, password }` | Login endpoint returning JWT. |
| `POST` | `/api/employees` | `{ employee_id, name, email, department_name }` | Import individual or CSV student records. |
| `POST` | `/api/auth/register-institution` | `{ institution_name, admin_name, email, password }` | Institution onboarding. |

### 1.2 Teacher Subject Lecture QR Endpoints (`/api/teacher`)
### 1.2 1-Click Student Face Activation Endpoint

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/teacher/start-session` | `{ subject_code, duration_minutes }` | Generates active lecture QR session token. |
| `GET` | `/api/teacher/live-attendance/:subject_code` | None | Returns real-time checking-in students stream. |
| `GET` | `/api/attendance/status/:roll_number` | None | Looks up student identity by Roll Number. |
| `POST` | `/api/attendance/activate-face` | `{ roll_number, face_vector }` | Binds 128-d camera selfie embedding to student profile. |

### 1.3 Kiosk Attendance Endpoint (`/api/attendance`)

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/attendance/check-in` | `{ employee_id, subject_code, lat, lng, method }` | Logs student attendance for specific subject session with GPS validation. |

---

## 2. Option B Mathematical Formulations
## 2. Approach 2 Mathematical Formulations

### Academic Defaulter Percentage Calculation (75% Threshold)

$$\text{Subject Attendance \%} = \left( \frac{\text{Attended Sessions for } CS101}{\text{Total Conducted Sessions for } CS101} \right) \times 100$$

If $\text{Subject Attendance \%} < 75\%$, the student is automatically flagged as a **Defaulter** on the Teacher & Admin dashboards.
If $\text{Subject Attendance \%} < 75\%$, the student is automatically flagged as a **Defaulter** for exam eligibility review.
