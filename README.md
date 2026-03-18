# ENGSE207 Software Architecture
## README — Final Lab Set 1: Microservices + HTTPS + Lightweight Logging

เอกสารฉบับนี้ใช้เป็น README.md สำหรับ repository ของ Final Lab Set 1

---

## 1. ข้อมูลรายวิชาและสมาชิก
* **รายวิชา:** ENGSE207 Software Architecture
* **ชื่องาน:** Final Lab — ชุดที่ 1: Microservices + HTTPS + Lightweight Logging

### สมาชิกในกลุ่ม
| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา |
| :--- | :--- | :--- |
| 1 | นาย ณฐภาพ สายหล้า | 67543210054-2 |
| 2 | นางสาว วรินทร เครืออินตา | 67543210065-8 |

**Repository:** `final-lab-set1/`

---

## 2. ภาพรวมของระบบ
Final Lab ชุดที่ 1 เป็นการพัฒนาระบบ Task Board แบบ Microservices โดยเน้นหัวข้อสำคัญดังนี้:
* **การทำงานแบบแยก Service:** แยกหน้าที่ความรับผิดชอบชัดเจน
* **API Gateway:** ใช้ Nginx เป็นประตูหลักของระบบ
* **HTTPS:** เปิดใช้งานด้วย Self-Signed Certificate (สร้างอัตโนมัติตอน Docker build)
* **Authentication:** ยืนยันตัวตนด้วย JWT (JSON Web Token)
* **Lightweight Logging:** จัดเก็บ Log กิจกรรมผ่าน Log Service ลงฐานข้อมูล
* **Frontend/Backend Sync:** เชื่อมต่อผ่าน HTTPS และจัดการปัญหา CORS ด้วย Reverse Proxy

---

## 3. วัตถุประสงค์ของงาน
* ออกแบบระบบแบบ Microservices ในระดับพื้นฐาน
* ใช้ Nginx สำหรับ Reverse Proxy และ TLS Termination
* ใช้ JWT สำหรับ Authentication ระหว่าง Service
* ออกแบบ Logging Flow ผ่าน REST API
* ใช้ Docker Compose ในการจัดการ Container Orchestration

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
# 5. โครงสร้าง Repository
final-lab-set1/
├── nginx/              # Nginx config & self-signed certs
├── frontend/           # Static HTML (Task Board & Log Dashboard)
├── auth-service/       # Node.js + Express (Login, JWT)
├── task-service/       # Node.js + Express (CRUD Tasks)
├── log-service/        # Node.js + Express (Internal logging & Admin API)
├── db/                 # PostgreSQL init script (Schema & Seed users)
├── scripts/            # Bash script สำหรับ Gen SSL Certificate
├── screenshots/        # รูปภาพหลักฐานการทดสอบระบบ
├── docker-compose.yml  # Docker deployment config
└── README.md           # โปรเจกต์ Document

# 6. เทคโนโลยีที่ใช้
Backend: Node.js / Express.js

Database: PostgreSQL 15

Gateway/Proxy: Nginx 1.25

Orchestration: Docker / Docker Compose

Frontend: HTML / CSS / JavaScript (Vanilla)

Security: JWT (jsonwebtoken), bcryptjs, SSL/TLS

# 7. การตั้งค่าและการรันระบบ
7.1 สร้างไฟล์ .env
Bash
# Linux / macOS
cp .env.example .env

# Windows PowerShell
copy .env.example .env
ค่าใน .env.example:

Plaintext
POSTGRES_DB=taskboard
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
JWT_SECRET=engse207-super-secret-change-me
JWT_EXPIRES=1h

7.2 รันระบบ
หมายเหตุ: ไม่จำเป็นต้องรัน gen-certs.sh ก่อน เพราะ Nginx Dockerfile สร้าง SSL certificate ให้อัตโนมัติตอน build

Bash
docker compose up --build

7.3 รีเซ็ตฐานข้อมูล (ถ้าต้องการเริ่มใหม่)
Bash
docker compose down -v
docker compose up --build

7.4 เปิดใช้งานผ่าน Browser
Task Board: https://localhost

Log Dashboard: https://localhost/logs.html

หมายเหตุ: เนื่องจากใช้ self-signed certificate browser จะขึ้นคำเตือนความปลอดภัย ให้กด Advanced → Proceed to localhost เพื่อเข้าทดสอบ

8. Seed Users สำหรับทดสอบ
Username	Email	              Password	       Role
alice	       alice@lab.local       1234                member
bob	       bob@lab.local	        bob456	       member
admin	       admin@lab.local	 adminpass	       admin

9. API Summary
Auth Service (port 3001)
Method              Path	       Auth	       หน้าที่
POST	       /api/auth/login	❌	       Login → JWT
GET	       /api/auth/verify	❌	       ตรวจสอบ JWT
GET	       /api/auth/me	       ✅ JWT	       ข้อมูลผู้ใช้ปัจจุบัน
GET	       /api/auth/health	❌	       Health check
Task Service (port 3002)
Method	              Path	       Auth	              หน้าที่
GET            /api/tasks/health	❌	              Health check
GET	        /api/tasks/	       ✅ JWT	              ดู tasks(admin เห็นทั้งหมด)
POST	         /api/tasks/	       ✅ JWT	              สร้าง task ใหม่
PUT	         /api/tasks/:id	✅ JWT	              แก้ไข task
DELETE	         /api/tasks/:id	✅ JWT	              ลบ task

10. การทดสอบระบบ
ลำดับการทดสอบ
รัน docker compose up --build

Login ด้วย seed users และตรวจสอบการสร้าง task

ทดสอบกรณีไม่มี JWT (ต้องได้ 401 Unauthorized)

ทดสอบ Log Dashboard (ต้อง login เป็น admin เท่านั้น)

ทดสอบ Rate Limiting ของการ Login (> 5 ครั้ง/นาที → 429)

ตัวอย่าง curl สำหรับทดสอบ
BASE="https://localhost"

# Login และรับ token
TOKEN=$(curl -sk -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"alice123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# ดู tasks ด้วย Token
curl -sk $BASE/api/tasks/ -H "Authorization: Bearer $TOKEN"

11. Screenshots ที่แนบในงาน
ตรวจสอบหลักฐานในโฟลเดอร์ screenshots/ ซึ่งประกอบด้วย 12 ภาพหลัก เช่น การรัน Docker, การใช้งาน HTTPS, ผลการ Login, การ CRUD Task และหน้า Log Dashboard ของ Admin


12. การแบ่งงานของทีม
รายละเอียดการแบ่งงานอยู่ในไฟล์ TEAM_SPLIT.md
รายงานรายบุคคล:

INDIVIDUAL_REPORT_675432100286.md — นายณฐภาพ สายหล้า

INDIVIDUAL_REPORT_675432100757.md — นางสาววรินทร เครืออินตา

13. ปัญหาที่พบและแนวทางแก้ไข
ปัญหา                               สาเหตุ                            แนวทางแก้ไข
Nginx crash ตอน start	       ไม่มีไฟล์ cert.pem	       แก้ Dockerfile ให้สร้าง cert อัตโนมัติตอน build
Auth service เริ่มก่อน DB	       PostgreSQL ยังไม่พร้อม	       เพิ่ม retry loop SELECT 1 ในโค้ดสูงสุด 10 ครั้ง
CORS error	                     เปิดผ่าน file:// โดยตรง	เข้าใช้งานผ่าน Nginx (Reverse Proxy) เท่านั้น
Task service ล่มเมื่อlog-service ดับ	logEvent() throw error	เปลี่ยนเป็น fire-and-forget (try/catch)

14. ข้อจำกัดของระบบ
ใช้ self-signed certificate เหมาะสำหรับการพัฒนาเท่านั้น
ใช้ shared database (ทำให้เกิด coupling ระหว่าง service)
ยังไม่มีระบบ register (ใช้เฉพาะ seed users)

15. การต่อยอดไปยัง Set 2
เพิ่มระบบ Register และ User Service แยกต่างหาก
เปลี่ยนจาก shared DB เป็น database-per-service
Deploy บนระบบ Cloud (Railway / Render / VPS)
เพิ่มระบบ Refresh Token เพื่อความปลอดภัยที่มากขึ้น

16. ภาคผนวก
ไฟล์สำคัญ:
docker-compose.yml: รวมทุก service
nginx/nginx.conf: จัดการ HTTPS และ Rate Limit
db/init.sql: จัดการโครงสร้างฐานข้อมูลและข้อมูลเริ่มต้น
