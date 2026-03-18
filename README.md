# ENGSE207 Software Architecture
## README — Final Lab Set 1: Microservices + HTTPS + Lightweight Logging

เอกสารฉบับนี้ใช้เป็น README.md สำหรับ repository ของ Final Lab Set 1

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
Final Lab ชุดที่ 1 เป็นการพัฒนาระบบ Task Board แบบ Microservices โดยเน้นหัวข้อสำคัญดังนี้:
* **การทำงานแบบแยก Service:** แบ่งหน้าที่ชัดเจน (Auth, Task, Log)
* **Nginx API Gateway:** ใช้เป็นทางเข้าเดียวของระบบ
* **HTTPS:** เปิดใช้งาน TLS ด้วย Self-Signed Certificate (สร้างอัตโนมัติตอน Build)
* **JWT Authentication:** ยืนยันตัวตนและกำหนดสิทธิ์การเข้าถึง API
* **Lightweight Logging:** ระบบจัดเก็บ Log กิจกรรมต่างๆ ลงฐานข้อมูลผ่าน Log Service
* **Shared Database:** ใช้ PostgreSQL 15 ร่วมกันในการจัดเก็บข้อมูล

---

## 3. Architecture Overview

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
