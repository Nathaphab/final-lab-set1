# ENGSE207 Software Architecture
## README — Final Lab Set 1: Microservices + HTTPS + Lightweight Logging

เอกสารฉบับนี้ใช้เป็นคู่มือสำหรับ Repository ของงาน **Final Lab Set 1** เพื่อประกอบการส่งงานในรายวิชา

---

## 1. ข้อมูลรายวิชาและสมาชิก
* **รายวิชา:** ENGSE207 Software Architecture
* **ชื่องาน:** Final Lab — ชุดที่ 1: Microservices + HTTPS + Lightweight Logging
* **Repository:** `final-lab-set1/`

### สมาชิกในกลุ่ม
| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา |
| :--- | :--- | :--- |
| 1 | นาย ณฐภาพ สายหล้า | 67543210054-2 |
| 2 | นางสาว วรินทร เครืออินตา | 67543210065-8 |

---

## 2. ภาพรวมของระบบ
ระบบ Task Board ที่พัฒนาด้วยสถาปัตยกรรม Microservices โดยเน้นหัวข้อสำคัญดังนี้:
* **Service Separation:** แยกหน้าที่ความรับผิดชอบชัดเจน (Auth, Task, Log)
* **API Gateway:** ใช้ Nginx เป็นประตูหลักและทำ Reverse Proxy
* **Security:** เปิดใช้งาน HTTPS (Self-Signed) และยืนยันตัวตนด้วย **JWT**
* **Logging:** ระบบ Lightweight Logging บันทึกกิจกรรมผ่าน Log Service ลง Database
* **Infrastructure:** ควบคุมการทำงานทั้งหมดผ่าน Docker Compose

---

## 3. วัตถุประสงค์ของงาน
* ออกแบบและจัดการระบบแบบ Microservices เบื้องต้น
* ประยุกต์ใช้ Nginx สำหรับ TLS Termination และ Rate Limiting
* ออกแบบการสื่อสารระหว่าง Service และการจัดการ CORS
* ฝึกการใช้ Docker Compose สำหรับระบบที่มีหลาย Container

---

## 4. Architecture Overview

```text
Browser / Postman
       │
       │ HTTPS :443  (HTTP :80 → redirect HTTPS)
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Nginx (API Gateway + TLS Termination + Rate Limiter)       │
│                                                             │
│  /api/auth/* → auth-service:3001                    │
│  /api/tasks/* → task-service:3002  [JWT required]    │
│  /api/logs/internal  → BLOCKED (403)                        │
│  /api/logs/* → log-service:3003   [admin JWT only]  │
│  /                   → frontend:80                          │
└──────┬───────────────┬──────────────────┬───────────────────┘
       │               │                  │
       ▼               ▼                  ▼
  auth-service    task-service       log-service
    :3001            :3002              :3003
       │               │                  │
       └───────────────┴──────────────────┘
                       │
              PostgreSQL :5432 (Shared Database)
              • users table | • tasks table | • logs table
```
## 5. โครงสร้าง Repository
final-lab-set1/
├── nginx/               # Nginx config & Dockerfile (SSL Auto-gen)
├── frontend/            # Static HTML (Task Board & Log Dashboard)
├── auth-service/        # Node.js + Express (Login, JWT)
├── task-service/        # Node.js + Express (CRUD Tasks)
├── log-service/         # Node.js + Express (Internal logging & Admin API)
├── db/                  # PostgreSQL init script (Schema & Seed users)
├── scripts/             # Bash script สำหรับ Gen SSL Certificate
├── screenshots/         # รูปภาพหลักฐานการทดสอบระบบ 12 รูป
└── docker-compose.yml   # Docker deployment config

## 6. เทคโนโลยีที่ใช้
Backend: Node.js / Express.js

Database: PostgreSQL 15

Proxy/Gateway: Nginx 1.25

Orchestration: Docker / Docker Compose

Frontend: HTML / CSS / JavaScript (Vanilla)

Security: JWT, bcryptjs, SSL/TLS

## 7. การตั้งค่าและการรันระบบ
7.1 สร้างไฟล์ .env
สร้างไฟล์ .env จาก template เพื่อตั้งค่าระบบ:
# Linux / macOS
cp .env.example .env

# Windows PowerShell
copy .env.example .env

ค่าพื้นฐานใน .env:

POSTGRES_DB=taskboard

POSTGRES_PASSWORD=secret123

JWT_SECRET=engse207-super-secret-change-me

## 7.2 การเริ่มทำงานระบบ
ไม่ต้องรันสคริปต์สร้าง Cert แยกต่างหาก เนื่องจาก Dockerfile ของ Nginx จะจัดการให้อัตโนมัติ
docker compose up --build
## 7.3 การเข้าใช้งาน
Task Board: https://localhost
Log Dashboard: https://localhost/logs.html
## 8. Seed Users สำหรับทดสอบ
Username       Email              Password       Role
alice	       alice@lab.local	1234	       member
bob	       bob@lab.local	       bob456	       member (นามสมุติ)
admin	       admin@lab.local	1234	       admin
## 9. API Summary
Auth Service (Port 3001)
Method              Path              Auth              หน้าที่
POST	            /api/auth/login	    ❌	       Login เพื่อรับ JWT
GET	            /api/auth/me	 ✅ JWT	ดูข้อมูลผู้ใช้ปัจจุบัน
## 10. การทดสอบระบบ (Test Cases)
Login: ตรวจสอบความถูกต้องของ JWT Token หลัง Login

Auth Guard: ทดสอบเข้าถึงหน้า Task โดยไม่มี Token (ต้องได้ 401)

Logging: ตรวจสอบว่าทุกการเคลื่อนไหวถูกบันทึกลง Log Dashboard

Rate Limiting: ทดสอบ Login ผิดเกิน 5 ครั้ง/นาที (ต้องได้ 429)

## 11. ปัญหาที่พบและแนวทางแก้ไข
ปัญหา                        สาเหตุ                                   แนวทางแก้ไข
Nginx crash ตอน start	ไม่มีไฟล์ cert.pem ในเครื่อง	       แก้ Dockerfile ให้รัน openssl สร้าง Cert อัตโนมัติ
Auth service เริ่มก่อน DB	Postgres ยังไม่พร้อมรับ connection	เพิ่ม Retry loop ในโค้ด Backend สูงสุด 10 ครั้ง
CORS error	              เปิดไฟล์ HTML ผ่าน file://	       ต้องเข้าใช้งานผ่าน Proxy ของ Nginx เท่านั้น

## 12. การต่อยอดและข้อจำกัด
ข้อจำกัด: ใช้ Shared Database (Coupling สูง), และใช้ Self-signed Certificate

Set 2: จะมีการแยก Database-per-service, เพิ่มระบบ Register และเปลี่ยนไปใช้ Cloud Deployment
