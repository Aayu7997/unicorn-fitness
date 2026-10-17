# Scripts Directory Index

This directory contains database management, maintenance tooling, and archived historical migration scripts.

---

## 📂 Subdirectories

### 1. `database/`
Utility scripts for database health checks, testing, and seeding:
- **`check-prisma.js`** — Validates connection to the Neon PostgreSQL database.
- **`test-prisma.js`** / **`test-prisma2.js`** — Test queries for user/admin data integrity.
- **`seed-video-highlights.js`** — Seeds initial video showcase URLs.

### 2. `maintenance/`
Active maintenance and data synchronization tools:
- **`audit.js`** — Scans codebase for formatting or syntax irregularities.
- **`cleanup.js`** — Cleans stale session or cache entries.
- **`download_exercises.js`** — Ingests workout and exercise datasets.
- **`update-schema.js`** — Programmatic schema synchronization helper.

### 3. `archive/`
Historical one-off patch scripts that have already been executed (kept for audit trail and reference).
- Includes legacy fix, clean, find, and update scripts used during development.
