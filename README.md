# GLI Platform: rent guarantee insurance for landlords

[![CI](https://github.com/HoussemEddineWeslati/RentPlatform_GLI/actions/workflows/ci.yml/badge.svg)](https://github.com/HoussemEddineWeslati/RentPlatform_GLI/actions/workflows/ci.yml)

A full-stack web application for **GLI** (*Garantie des Loyers Impayés*, rent guarantee insurance).
Landlords register their properties and tenants, assess a candidate tenant's risk, receive an
insurance quote, subscribe to a policy and file claims when rent goes unpaid. Policies, quotes,
claims and risk reports are generated as PDF documents.

## Features

- **Accounts:** sign-up with email verification code, login, password reset, profile, session-based authentication with rate limiting.
- **Landlords, properties and tenants:** full management, with each property linked to its tenants.
- **Tenant risk scoring:** a configurable scoring engine turns an applicant's profile into a 0–100 safety score, a 12-month probability of default and a decision (accept, conditional, decline), with plain-language reasons.
- **Quotes and policies:** insurance premium calculation, policy subscription and PDF policy documents.
- **Claims:** filing and tracking unpaid-rent claims, with PDF claim reports.
- **Email notifications** for verification and account events.

## Tech stack

| Layer | Technologies |
|---|---|
| Front end | React, TypeScript, Vite, TanStack Query, React Hook Form + Zod, Tailwind CSS, shadcn/ui |
| Back end | Node.js, Express, TypeScript, Zod validation, express-session, rate limiting |
| Data | PostgreSQL with Drizzle ORM and migrations |
| Documents and email | PDFKit, Resend |
| Testing | Vitest, fast-check (property-based tests) |

## Project structure

```text
backend/server/
  index.ts              server entry point
  src/routes/           auth, landlords, properties, tenants, policies, claims, risk decisioning
  src/controllers/      request handling per resource
  src/services/         risk scoring, PDF generation, email
  src/validators/       Zod schemas for risk input and scoring configuration
  src/database/         Drizzle schema, connection and data access
  migrations/           database migrations
frontend/client/
  src/pages/            dashboard, landlords, properties, tenants, quote, policies, claims, profile, auth
  src/components/       UI components and forms
  src/hooks, src/lib    data fetching and helpers
```

## Risk scoring and its tests

The scoring engine (`backend/server/src/services/riskService.ts`) scores five components
(personal situation, employment and income, financial obligations, housing history, other factors),
re-scales them to configurable weights, and derives the probability of default and the decision
from configurable thresholds.

It is covered by example tests and by **property-based tests**, which generate hundreds of random
applicant profiles and check invariants that must always hold:

- the safety score stays between 0 and 100, and the probability of default between 0 and its configured maximum;
- no component ever exceeds its configured weight;
- the decision always matches the configured thresholds;
- removing a past default never lowers an applicant's score.

```bash
cd backend/server
npm install
npm test
```

## Running locally

Requirements: Node.js 20+, a PostgreSQL database.

```bash
# API
cd backend/server
npm install
cp .env.example .env   # then fill in DATABASE_URL, SESSION_SECRET and the email settings
npm run db:push        # create the tables
npm run dev            # http://localhost:5000

# Client (in another terminal)
cd frontend/client
npm install
npm run dev            # http://localhost:5173
```

## Author

**Houssem Eddine Weslati**, full stack engineer. Portfolio: [houssemweslati.com](https://houssemweslati.com)
