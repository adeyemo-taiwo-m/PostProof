<div align="center">

# Postproof

### Proof worth posting.

Collect customer testimonials with one link, then turn the best words into branded content.

![Status](https://img.shields.io/badge/status-MVP%20foundation-F2542D)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Storage-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)

</div>

---

## Overview

Postproof is a focused testimonial collection tool for small businesses, freelancers, agencies, and service providers.

The core loop is deliberately simple:

1. Create a business profile and public testimonial link.
2. Let customers submit testimonials without an account.
3. Review submissions and capture explicit marketing consent.
4. Turn approved, consented testimonials into branded content.

Postproof is built around real customer words. It does not generate, rewrite, or fabricate testimonials.

## Current status

The repository currently contains the product foundation and public collection experience.

### Available

- Interactive marketing landing page
- Email/password authentication through Supabase Auth
- Protected route handling through Next.js proxy
- Business onboarding and brand profile creation
- Business logo upload with private Storage policies
- Public testimonial page at /t/[slug]
- Zod validation, honeypot protection, rate limiting, and consent capture
- PostgreSQL schema, Row Level Security, and Storage policies
- Responsive styling and reduced-motion support

### In progress

- Dashboard overview and navigation targets
- Testimonial list, detail, moderation, and deletion flows
- Settings page
- Consent-aware graphic generation
- Automated unit, integration, and end-to-end tests

This README describes the repository as it exists today. Planned capabilities are labelled clearly.

## Product principles

- **Simple for owners, effortless for customers.** The public form is focused, mobile-friendly, and account-free.
- **Real words only.** Testimonials are never rewritten or invented.
- **Consent is a hard gate.** Marketing permission is required before a testimonial can become a public graphic.
- **Private by default.** Business and testimonial data is owner-scoped and protected by server checks and RLS.
- **Focused by design.** Postproof is a testimonial workflow, not a CRM.

## Documentation

| Document | Purpose |
| --- | --- |
| [Implementation notes](./Implementation.md) | Product decisions, implementation requirements, and delivery plan |
| [Style guide](<./STYLE_GUIDE (1).md>) | Visual language, component behavior, and graphic direction |
| [Button reference](./BUTTONS.md) | Button variants and interaction guidance |
| [Environment template](./.env.example) | Required environment variables |

## Technology

| Layer | Implementation |
| --- | --- |
| Framework | Next.js App Router with TypeScript |
| UI | React, Motion, Lucide React |
| Styling | Global CSS and component-level CSS |
| Authentication | Supabase Auth with @supabase/ssr |
| Database | Supabase PostgreSQL |
| Storage | Private Supabase Storage buckets |
| Validation | Zod |
| Forms | React Hook Form and controlled React forms |
| Image tooling | Sharp, reserved for the graphic renderer |
| Rate limiting | Upstash Redis when configured; local fallback for development |
| Deployment target | Vercel |

## Getting started

### Prerequisites

- Node.js LTS
- npm
- Git
- A Supabase project

### Install

~~~bash
npm install
cp .env.example .env.local
npm run dev
~~~

On Windows PowerShell:

~~~powershell
Copy-Item .env.example .env.local
npm run dev
~~~

Open http://localhost:3000.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Yes | Public Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Browser and server Supabase clients |
| SUPABASE_SERVICE_ROLE_KEY | Yes for testimonial intake | Server-only admin access |
| NEXT_PUBLIC_APP_URL | Recommended | Auth redirect base URL |
| UPSTASH_REDIS_REST_URL | Optional | Shared production rate limiting |
| UPSTASH_REDIS_REST_TOKEN | Optional | Upstash authentication |

Never expose SUPABASE_SERVICE_ROLE_KEY to the browser or commit .env.local.

### Supabase setup

Apply these migrations in order:

1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_rls_policies.sql
3. supabase/migrations/003_storage_policies.sql

Then:

1. Enable email/password authentication.
2. Set local and production Site URLs.
3. Add the auth redirect URLs used by the application.
4. Confirm business-logos and testimonial-graphics are private buckets.
5. Confirm RLS is enabled on every application table.

## Commands

~~~bash
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Serve the production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Run the TypeScript checker
~~~

## Architecture

### Request flow

~~~text
Browser
  -> Next.js route or route handler
  -> Supabase SSR client
  -> Auth and ownership checks
  -> Database or private Storage
~~~

### Public testimonial flow

~~~text
Customer
  -> /t/[slug]
  -> POST /api/testimonials
  -> Zod validation and rate limit
  -> Business lookup by slug
  -> Pending testimonial insert
  -> Confirmation state
~~~

### Supabase clients

- src/lib/supabase/browser.ts: browser client for interactive auth actions.
- src/lib/supabase/server.ts: cookie-aware server client.
- src/lib/supabase/admin.ts: narrowly scoped server-only service-role client.
- src/lib/server-context.ts: authenticated-user and owned-business redirects.

### Authentication

src/proxy.ts refreshes the Supabase session and protects /onboarding and /dashboard/*. Guests are sent to /login; authenticated users are sent away from auth pages.

## Routes

### Public

| Route | Purpose |
| --- | --- |
| / | Marketing landing page |
| /t/[slug] | Public testimonial submission page |

### Authentication

| Route | Purpose |
| --- | --- |
| /login | Sign in |
| /signup | Create an account |
| /forgot-password | Request a password reset |
| /reset-password | Set a new password |

### Protected

| Route | Status | Purpose |
| --- | --- | --- |
| /onboarding | Available | Create the owner's business profile |
| /dashboard | Shell present | Protected dashboard layout and navigation |
| /dashboard/testimonials | In progress | Testimonial list and filters |
| /dashboard/settings | In progress | Business and brand settings |

### API

| Method and route | Purpose |
| --- | --- |
| GET /api/business | Load the signed-in owner's business |
| POST /api/business | Create a business during onboarding |
| PUT /api/business | Update the signed-in owner's business |
| POST /api/business/logo | Upload a private business logo |
| DELETE /api/business/logo | Remove the current business logo |
| POST /api/testimonials | Validate and store a public testimonial |

## Data model

The schema is defined in supabase/migrations/001_initial_schema.sql and typed in src/types/database.ts.

| Table | Responsibility |
| --- | --- |
| profiles | Auth-linked owner profile |
| businesses | Business identity, public slug, branding, and onboarding state |
| testimonials | Customer text, display preference, consent, and moderation status |
| generated_graphics | Planned metadata for generated testimonial graphics |

### Important rules

- Each owner has one business in the current MVP model.
- Public submissions resolve the business from slug on the server.
- Testimonial status is pending, approved, or rejected.
- marketing_consent is separate from status.
- consented_at is set only when marketing permission is granted.
- Generated graphics must belong to the same business as their source testimonial.

## Security and privacy

- Validate all external payloads with Zod on the server.
- Resolve businesses from slugs; never trust a client-supplied business ID.
- Rate-limit public submissions and enforce a request-size limit.
- Use a honeypot field to reduce automated abuse.
- Keep testimonials private by default.
- Enforce ownership in application code and Supabase RLS.
- Store logos in private Storage paths.
- Keep the service-role key in server-only modules.
- Never generate a public graphic without approved status and marketing consent.
- Escape user text before it enters any future SVG renderer.
- Return safe public errors instead of raw database errors or stack traces.

## Public testimonial experience

The public form is designed for a customer arriving from a message on a phone:

1. See the business identity and optional logo.
2. Write a testimonial between 20 and 1,000 characters.
3. Optionally enter a name.
4. Choose full name, first name, or anonymous display.
5. Give or withhold marketing permission.
6. Submit without creating an account.
7. See an inline confirmation state.

Example request:

~~~json
{
  "slug": "bright-smiles-studio",
  "testimonial_text": "I had a great experience working with this team.",
  "customer_name": "Jane Doe",
  "name_display": "first_name",
  "marketing_consent": true,
  "website": ""
}
~~~

website is a honeypot field and must remain empty for a normal submission.

## Brand and interface direction

Postproof uses a warm editorial visual language:

| Token | Value | Role |
| --- | --- | --- |
| Coral | #F2542D | Primary actions and brand accent |
| Ink | #14110F | Text and dark surfaces |
| Paper | #FAF7F2 | Main background |
| Muted | #6B645C | Secondary copy and quiet navigation |

The application uses Plus Jakarta Sans for display and interface text, with JetBrains Mono for technical labels and metadata. Motion is restrained and respects prefers-reduced-motion.

Business colors are scoped to the public testimonial experience and future generated graphics. They do not recolor the Postproof dashboard.

## Project structure

~~~text
src/
├── app/
│   ├── (auth)/                  Authentication pages
│   ├── api/                     Route handlers
│   ├── dashboard/               Protected dashboard shell
│   ├── t/[slug]/                Public testimonial page
│   ├── onboarding/              Business setup page
│   ├── globals.css              Shared application styles
│   ├── landing.css              Landing page styles
│   ├── layout.tsx               Root layout and metadata
│   └── page.tsx                 Landing route
├── components/
│   ├── auth/                    Auth shell and form
│   ├── dashboard/               Business form and sign out
│   ├── landing/                 Interactive marketing sections
│   └── public/                  Public testimonial form
├── lib/
│   ├── supabase/                Browser, server, and admin clients
│   ├── validations/             Zod schemas
│   ├── utils/                   Formatting, slug, and color helpers
│   ├── env.ts                   Environment access
│   ├── rate-limit.ts            Submission rate limiting
│   └── server-context.ts        Authenticated server helpers
├── proxy.ts                     Session refresh and access guard
└── types/database.ts            Supabase database types

supabase/
└── migrations/                  Schema, RLS, and Storage policies

public/
└── after-hero.jpg               Landing page artwork
~~~

## Development conventions

- Keep server-only logic out of client components.
- Validate every external payload on the server.
- Preserve owner isolation in both code and RLS.
- Keep public pages focused and mobile-first.
- Use existing design tokens before adding new colors or shadows.
- Add loading, success, error, and empty states to interactive flows.
- Label sample testimonials clearly on marketing surfaces.
- Do not present planned features as implemented.

## Roadmap

### Next release

- Complete dashboard overview and navigation targets
- Add testimonial list, detail, moderation, and deletion flows
- Add dashboard settings
- Add consent-aware graphic eligibility states

### Later

- Minimal, Bold, and Editorial graphic templates
- Portrait, Square, and Story exports
- Preview-to-export parity checks
- Automated browser coverage for the owner/customer journey
- Notifications, analytics, team accounts, custom domains, and embeds

AI-assisted categorisation or copy suggestions may be considered later, but Postproof must never fabricate customer experiences.

## Verification

Before considering a change ready:

~~~bash
npm run lint
npx tsc --noEmit
npm run build
~~~

For user-facing changes, also test desktop and mobile layouts, keyboard focus, reduced motion, authenticated and logged-out behavior, validation states, ownership boundaries, and consent boundaries.

## License

No public license has been selected yet. Treat this repository as private unless the project owner states otherwise.

---

<div align="center">

**Create a link. Collect the good words. Share them with intention.**

</div>
