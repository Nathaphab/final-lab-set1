# 📋 ENGSE207 Software Architecture - Final Lab ชุดที่ 1
**Microservices + HTTPS + Basic Logging**

## 👥 รายชื่อสมาชิก (Team Members)
- [67543210054-2] [ณฐภาพ สายหล้า]
- [67543210065-8] [วรินทร เครืออินตา]

---

## 🎯 ภาพรวมและวัตถุประสงค์ (Overview & Objectives)
โปรเจกต์นี้เป็นการพัฒนาระบบ Task Board ด้วยสถาปัตยกรรม Microservices โดยเน้นการตั้งค่าความปลอดภัยและระบบจัดการ Log ส่วนกลาง 
- **Security:** ใช้ Nginx เป็น API Gateway จัดการ HTTPS (Self-Signed Certificate) และ Rate Limiting
- **Authentication:** ระบบ Login ด้วย Seed Users (ไม่มีการ Register) และป้องกัน API ด้วย JWT 
- **Centralized Logging:** ระบบ Lightweight Logging ที่รับ Log จาก Service ต่างๆ ภายในวง Network ของ Docker และบันทึกลง PostgreSQL

---

## 🏗️ สถาปัตยกรรม (Architecture Diagram)

```text
Browser / Postman
       │
       │ HTTPS :443  (HTTP :80 → redirect HTTPS)
       ▼
┌──────────────────────────────────────────────────────────────┐
│  🛡️ Nginx (API Gateway + TLS Termination + Rate Limiter)     │
│                                                              │
│  /api/auth/* → auth-service:3001  (ไม่ต้องมี JWT)    │
│  /api/tasks/* → task-service:3002  [JWT required]     │
│  /api/logs/internal  → BLOCKED (403 จาก Nginx)               │
│  /api/logs/* → log-service:3003   [JWT + admin only] │
│  /                   → frontend:80        (Static HTML)      │
└──────┬──────────────┬─────────────────┬──────────────────────┘
       │              │                 │
       ▼              ▼                 ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────────┐
│ 🔑 Auth Svc  │ │ 📋 Task Svc   │ │ 📝 Log Service   │
│   :3001      │ │   :3002       │ │   :3003          │
└──────┬───────┘ └───────┬───────┘ └──────────────────┘
       │                 │                    │
       └─────────────────┴────────────────────┘
                         │
               ┌─────────────────────┐
               │  🗄️ PostgreSQL      │
               │  (Shared DB)        │
               │  • users, tasks, logs
               └─────────────────────┘

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
