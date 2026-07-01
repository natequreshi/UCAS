# UCAS — University Course Allocation System

> **University of Punjab, Lahore, Pakistan**
> Department of Computer Science & Information Technology

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## Project Scope

UCAS is a full-featured University Course Allocation and Timetable Management System built exclusively for the **University of Punjab**. It automates the complex process of scheduling courses, assigning instructors, allocating rooms, and generating conflict-free timetables for thousands of students across multiple programs (BS, MS, PhD).

### Key Functional Areas

| Module | Description |
|---|---|
| **Data Import** | Excel-based bulk import for students, teachers, courses, rooms, sections |
| **Schedule Generation** | CSP + Genetic Algorithm engine producing multiple permutation timetables |
| **Manual Scheduling** | Drag-and-drop board with real-time clash detection |
| **Teacher Management** | Preferences, availability, track (teaching/research), seniority exemptions |
| **Student Timetable** | Personal clash-free timetable generator with multiple permutations |
| **Academic Progress** | CGPA tracking, roadmap alignment, credit hour progress |
| **Probation & Deferment** | Automated probation detection, deferment course selection |
| **Reporting** | PDF reports for allocations, loads, timetables, utilization, progress |
| **Email Dispatch** | Bulk or individual schedule/timetable emails to teachers and students |
| **Admin Control** | User roles, computer-level access restrictions, audit log |

### Constraint Engine Highlights

- **Friday Prayer Break** — No classes during configurable Jummah window (default 12:30–2:00 PM Fri)
- **One Free Day Per Week** — Hard constraint for every teacher and student
- **Time Window Enforcement** — BS classes 8 AM–6 PM; MS/PhD flexible up to 8/9 PM; Computer labs 4–7 PM only
- **Teacher Types** — Permanent, Contract, Adjunct, Visiting (each with distinct allocation rules)
- **Course Categories** — Compulsory, Elective, Allied (each with distinct scheduling priority and time windows)
- **Prerequisite Chains** — Enforced across roadmaps and student timetable generation
- **Summer Semester** — Separate schedule for selected courses only
- **Grading Modes** — Relative (default) and Absolute per course/batch

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Actions, API Routes) |
| **UI** | shadcn/ui + Tailwind CSS (blue/white theme) |
| **Database** | PostgreSQL 15 (schema: `timetable`) |
| **ORM** | Prisma 5 (type-safe, schema-first) |
| **Auth** | NextAuth.js v4 (Credentials provider, JWT sessions) |
| **State** | Zustand (client-side: active schedule, filters, selections) |
| **Excel I/O** | ExcelJS (template generation + bulk import parsing) |
| **PDF** | Puppeteer (headless Chrome renders report pages) |
| **Email** | Nodemailer (SMTP dispatch) |
| **Drag & Drop** | dnd-kit (schedule board with collision detection) |
| **Charts** | Recharts (CGPA trends, utilization heatmaps, dashboard stats) |
| **Validation** | Zod (API + Excel import row validation) |
| **Background Jobs** | BullMQ + Redis (long-running schedule generation) |
| **Deployment** | Dokploy (Docker-based VPS management with SSL) |
| **Version Control** | Git |

### Database Design Philosophy

UCAS database design is inspired by **UniTime** (Apache 2.0 licensed open-source university timetabling system). Key patterns adopted:

- **Bitmask time encoding** — `days_code` (Mon=1, Tue=2, Wed=4, Thu=8, Fri=16, Sat=32) for fast bitwise clash queries
- **Slot-based time** — `slot = minutes_from_midnight / 5` (5-minute resolution; 288 slots/day)
- **Preference levels** — 5-level system: -2=Required, -1=Strongly Preferred, 0=Preferred, +1=Discouraged, +2=Prohibited
- **Solution/Assignment structure** — one `ScheduleSolution` per permutation, many `Assignment` rows
- **Distribution constraints** — SAME_ROOM, BACK_TO_BACK, SPREAD, etc. per UniTime patterns
- **UUID primary keys**, soft deletes via `isActive`, append-only SHA-256 hash-chained audit log

---

## Project Structure

```
UCAS/
├── README.md
├── .env.example                  # Environment variable template
├── .env.local                    # Local secrets (never commit)
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json               # shadcn/ui config
├── Dockerfile                    # Production Docker image
├── docker-compose.yml            # VPS production stack
├── docker-compose.dev.yml        # Local development (DB + Redis only)
├── .dockerignore
│
├── prisma/
│   ├── schema.prisma             # Full 35+ model schema
│   └── seed.ts                   # Seed: roles, preference levels, dist types
│
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx            # Root layout (fonts, providers)
    │   ├── page.tsx              # Redirect → /dashboard or /login
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   └── login/
    │   │       ├── page.tsx      # Login page (shadcn form)
    │   │       └── actions.ts    # Server action: signIn
    │   └── (dashboard)/
    │       ├── layout.tsx        # Sidebar + header shell
    │       ├── page.tsx          # Dashboard home (module cards)
    │       ├── schedule/         # Schedule maker (dnd-kit board)
    │       ├── teachers/         # Teacher management
    │       ├── students/         # Student management
    │       ├── courses/          # Course & roadmap management
    │       ├── rooms/            # Rooms & buildings
    │       ├── timetable/        # Student timetable generator
    │       ├── progress/         # Academic progress
    │       ├── probation/        # Probation & deferment
    │       ├── reports/          # PDF report hub
    │       ├── import/           # Excel bulk import
    │       └── admin/            # User admin & settings
    │
    ├── components/
    │   ├── ui/                   # shadcn/ui base components
    │   └── layout/               # Sidebar, header, breadcrumbs
    │
    ├── lib/
    │   ├── utils.ts              # cn(), date helpers, slot↔time
    │   ├── prisma.ts             # Prisma client singleton
    │   ├── auth.ts               # NextAuth config
    │   └── constants.ts          # Days bitmasks, slot maps, enums
    │
    ├── hooks/                    # Client hooks (useSchedule, useClash, etc.)
    ├── store/                    # Zustand stores
    ├── types/                    # Shared TypeScript types
    └── middleware.ts             # Route protection (NextAuth)
```

---

## Prerequisites

- **Node.js** ≥ 18.17
- **npm** ≥ 9
- **Docker Desktop** (for local PostgreSQL + Redis)
- **Git**

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/ucas.git
cd ucas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start local database and Redis

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL 15** on `localhost:5432` (db: `ucas`, user: `ucas_user`)
- **Redis 7** on `localhost:6379`

### 4. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see [Environment Variables](#environment-variables) below).

### 5. Run database migrations and seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin credentials (seed data):**
- Email: `admin@ucas.edu.pk`
- Password: `Admin@123`

> ⚠️ Change the admin password immediately after first login.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development. For production, set these in Dokploy's environment settings.

```env
# ─── Database ─────────────────────────────────────────────
DATABASE_URL="postgresql://ucas_user:ucas_pass@localhost:5432/ucas?schema=timetable"

# ─── NextAuth ─────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-min-32-chars-change-in-prod"

# ─── Redis (BullMQ) ───────────────────────────────────────
REDIS_URL="redis://localhost:6379"

# ─── Email (Nodemailer / SMTP) ───────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="ucas@pu.edu.pk"
SMTP_PASS="your-app-password"
SMTP_FROM="UCAS <ucas@pu.edu.pk>"

# ─── University ───────────────────────────────────────────
UNIVERSITY_NAME="University of Punjab"
UNIVERSITY_SHORT="PU"
UNIVERSITY_LOCATION="Lahore, Pakistan"

# ─── App ──────────────────────────────────────────────────
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

---

## Database Setup

### Schema namespace

All tables live in the `timetable` PostgreSQL schema (not `public`). This keeps UCAS tables isolated if the database is shared.

The `DATABASE_URL` must include `?schema=timetable`. Prisma handles schema creation automatically on `migrate dev`.

### Key design decisions

| Decision | Choice | Reason |
|---|---|---|
| Primary keys | UUID v4 | Safe for distributed inserts, no sequential guessing |
| Soft deletes | `isActive` boolean | Preserve historical data; re-activate without re-entry |
| Time encoding | `slot` int (min/5) | O(1) bitmask overlap test: `(a.days_code & b.days_code) != 0 AND slots_overlap(a, b)` |
| Preference | -2 to +2 int | Compatible with UniTime's proven constraint weight system |
| Audit log | SHA-256 hash chain | Tamper-evident: each record includes hash of previous record |

### Generate Prisma client after schema changes

```bash
npx prisma generate
npx prisma migrate dev --name "describe_your_change"
```

---

## Deployment on VPS with Dokploy

### 1. Provision your VPS

Recommended: Ubuntu 22.04 LTS with ≥ 4 GB RAM, 2 vCPU, 40 GB SSD.

### 2. Install Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Access Dokploy panel at `http://YOUR_VPS_IP:3000`.

### 3. Add PostgreSQL and Redis services in Dokploy

In Dokploy → Services → Create Service → select **PostgreSQL 15** and **Redis 7**. Note the internal connection strings Dokploy generates.

### 4. Create UCAS application service

- Source: **Git** — connect your GitHub/GitLab repository
- Build: **Dockerfile** (root of repo)
- Port: **3000**
- Set all environment variables from the table above (use Dokploy's env manager)

### 5. Configure domain and SSL

In Dokploy → Domains → Add Domain → enter your domain → enable **Let's Encrypt**. Dokploy handles Traefik reverse proxy and auto-renewal.

### 6. Deploy

Push to your `main` branch. Dokploy auto-builds and rolls out zero-downtime.

---

## Git Workflow

```
main          ← production (protected, Dokploy auto-deploys)
develop       ← integration branch
feature/*     ← individual features (PR → develop)
hotfix/*      ← urgent production fixes (PR → main + develop)
```

### Commit convention

```
feat: add bulk Excel import for teachers
fix: correct Friday prayer break window calculation
chore: update Prisma schema with ProbationRecord model
docs: update README with deployment steps
```

---

## Version History

### v0.1.0 — Initial Project Scaffold *(2026-06-30)*

**Initial commit — project foundation established.**

- Next.js 14 app (App Router) created with TypeScript
- shadcn/ui + Tailwind CSS configured (UCAS blue theme: `#4F46E5` / indigo)
- NextAuth.js v4 with Credentials provider and JWT sessions
- Prisma 5 schema with 35+ models across auth, academic, scheduling, progress domains
- UniTime-inspired database design: bitmask time encoding, preference levels, solution/assignment structure
- Login page with University of Punjab branding
- Dashboard with module navigation cards
- Sidebar + header layout components
- Route protection middleware
- Docker Compose for local development (PostgreSQL 15 + Redis 7)
- Dockerfile for production Dokploy deployment
- Database seed: admin user, roles, permissions, preference levels, distribution types
- `.env.example` template with all required variables
- Git repository initialized

---

*Subsequent versions will be appended above as features are merged.*

---

## Modules Roadmap

| Version | Module |
|---|---|
| v0.2.0 | Admin panel — user management, roles, computer access restrictions |
| v0.3.0 | Data import — Excel templates for all 16 entity types |
| v0.4.0 | Teacher management — preferences, availability, track, exemptions |
| v0.5.0 | Course & roadmap management — prerequisites, credit hours, categories |
| v0.6.0 | Room & building management — lab types, capacities, time constraints |
| v0.7.0 | Section & semester management — batch cohorts, summer semester |
| v0.8.0 | Schedule board — drag-and-drop dnd-kit board, real-time clash detection |
| v0.9.0 | CSP schedule generation — backtracking + AC-3 constraint propagation |
| v0.10.0 | Genetic Algorithm optimizer — multiple permutations, fitness scoring |
| v0.11.0 | Student timetable generator — personal clash-free view |
| v0.12.0 | Academic progress — CGPA, roadmap alignment, credit hours |
| v0.13.0 | Probation & deferment — auto-detection, course selection |
| v0.14.0 | PDF reports — allocations, loads, timetables, utilization, clash |
| v0.15.0 | Email dispatch — bulk and individual, teachers + students |
| v1.0.0 | **Full production release** — all modules complete + tested |

---

## License

Proprietary — developed for the exclusive use of the **University of Punjab, Lahore, Pakistan**.  
Unauthorized distribution, copying, or modification is prohibited.

---

*Built with ❤️ for the University of Punjab*
