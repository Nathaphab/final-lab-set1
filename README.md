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


## 5. โครงสร้าง Repository
```text
final-lab-set1/
├── README.md
├── TEAM_SPLIT.md
├── INDIVIDUAL_REPORT_675432100286.md
├── INDIVIDUAL_REPORT_675432100757.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── nginx/
│   ├── Dockerfile          ← สร้าง SSL cert อัตโนมัติตอน build
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   ├── index.html          ← Task Board UI + JWT Inspector
│   └── logs.html           ← Log Dashboard (admin only)
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/auth.js
│       ├── middleware/jwtUtils.js
│       └── db/db.js
├── task-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/tasks.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── db/db.js
├── log-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js
├── db/
│   └── init.sql            ← Schema + Seed Users (bcrypt hash พร้อมใช้)
├── scripts/
│   └── gen-certs.sh        ← สำหรับ Linux/macOS (Windows ไม่จำเป็น)
└── screenshots/
    └── (ภาพหลักฐาน 12 รูป)

```text
final-lab-set1/
├── README.md
├── TEAM_SPLIT.md
├── INDIVIDUAL_REPORT_675432100286.md
├── INDIVIDUAL_REPORT_675432100757.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── nginx/
│   ├── Dockerfile          ← สร้าง SSL cert อัตโนมัติตอน build
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   ├── index.html          ← Task Board UI + JWT Inspector
│   └── logs.html           ← Log Dashboard (admin only)
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/auth.js
│       ├── middleware/jwtUtils.js
│       └── db/db.js
├── task-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── routes/tasks.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── db/db.js
├── log-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/index.js
├── db/
│   └── init.sql            ← Schema + Seed Users (bcrypt hash พร้อมใช้)
├── scripts/
│   └── gen-certs.sh        ← สำหรับ Linux/macOS (Windows ไม่จำเป็น)
└── screenshots/
    └── (ภาพหลักฐาน 12 รูป)
