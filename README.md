# rca-talent

Frontend for **RCA Talent** — a recruitment marketplace connecting Rwanda Coding Academy (RCA) students and graduates with employers.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui (Radix primitives)
- **React Hook Form** + Zod
- **TanStack Query** for server state
- **Mock API layer** (swap to NestJS REST backend by setting `NEXT_PUBLIC_USE_MOCK=false`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

All demo accounts use password: `password123`

| Role    | Email              |
|---------|--------------------|
| Student | alice@student.rw   |
| Company | hr@techkigali.rw   |
| Admin   | admin@rca.rw       |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── for-students/       # Marketing: students
│   ├── for-companies/      # Marketing: companies
│   ├── login/              # Auth
│   ├── register/
│   ├── student/            # Student portal
│   ├── company/            # Company portal
│   └── admin/              # Admin dashboard
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── shared/             # AppShell, StatusBadge, DataTable, etc.
├── hooks/                  # useNotifications, useToast
├── lib/
│   ├── api/                # Typed API clients (auth, students, companies, admin)
│   ├── auth/               # Auth context (JWT session mock)
│   ├── mock/               # In-memory mock data store
│   ├── design-tokens.ts
│   └── i18n.ts             # i18n-ready strings helper
└── types/                  # TypeScript interfaces
```

## Portals

### Public
- Landing page with hero, how-it-works, value props
- For Students / For Companies info pages
- Login & Register with role toggle

### Student (`/student`)
- Dashboard with verification banner, summary cards
- Multi-step profile builder (bio, skills, links, mock uploads)
- Project CRUD
- Contact request inbox (accept/decline)
- Settings with visibility toggle

### Company (`/company`)
- Dashboard with request stats
- Talent search with filters (skills, cohort, availability)
- Student profile view + send contact request
- Sent requests tracker
- Company profile setup

### Admin (`/admin`)
- Platform metrics with recharts
- Verification queue (approve/reject with reason)
- User management (suspend/reactivate)
- Audit log

## Connecting to Real Backend

Set in `.env.local`:

```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://your-api.example.com/api
```

The API client in `src/lib/api/*.ts` will use fetch against the NestJS backend. Components remain unchanged.

## Out of Scope (v1)

- Payment/subscription flows
- In-app real-time chat
- Automated identity verification (OCR/registrar)
- Peer/teacher endorsements
- Detailed student analytics-over-time

See `TODO` comments in code for future integration points.
