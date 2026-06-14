# Identity V Price Calculator

A production-ready full-stack web application for calculating Identity V skin prices from echoes/buttons into Thai Baht. Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js, and AWS S3.

## Features

### Public
- Homepage with product overview
- Skin list with search and category filter
- Multi-select skins with real-time price calculation
- Total button count and Thai Baht totals
- Mobile-first responsive design

### Admin
- Secure admin login (Auth.js Credentials)
- Protected admin routes with middleware
- Dashboard overview
- CRUD for categories, skins, and settings
- AWS S3 image upload for skin images
- Button-to-baht conversion rate management

## Tech Stack

- **Framework:** Next.js 15+ App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** PostgreSQL (Neon compatible) + Prisma ORM
- **Auth:** Auth.js (next-auth v5) with Credentials Provider
- **Storage:** AWS S3
- **Forms:** React Hook Form + Zod

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin routes (login + protected dashboard)
│   ├── skins/            # Public skin calculator
│   └── api/              # Auth + S3 image upload routes
├── actions/              # Server Actions (CRUD)
├── components/           # Shared UI and layout components
├── features/             # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Auth, Prisma, AWS S3 utilities
├── services/             # Business logic services
├── types/                # TypeScript types
└── validators/           # Zod schemas
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Sample seed data
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- AWS S3 bucket for image storage

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | S3 region |
| `AWS_S3_BUCKET_NAME` | S3 bucket name |
| `AWS_S3_PUBLIC_URL` | Public base URL for uploaded images (optional; CloudFront supported) |
| `AWS_S3_PUBLIC_READ` | Set `true` when bucket policy allows public read on image folders |
| `NEXT_PUBLIC_AWS_S3_PUBLIC_READ` | Same as above for client-side image URLs (set both to `true`) |
| `NEXT_PUBLIC_AWS_S3_PUBLIC_URL` | Public S3 base URL exposed to the browser |

When `AWS_S3_PUBLIC_READ=true`, images load directly from S3 (faster, less hosting bandwidth). When `false`, images are served via `/api/images/...` proxy (works with private buckets).

### Image upload flow

1. Admin selects an image in the dashboard.
2. The browser uploads the file to `POST /api/upload`.
3. The API validates the file and uploads it to S3 (`skins/`, `items/`, `packages/`, or `banners/`).
4. The API returns the public image URL.
5. Server actions save only the URL string in PostgreSQL (`Item.imageUrl`, `Package.imageUrl`, `Banner.imageUrl`).

Supported formats: JPG, JPEG, PNG, WebP (max 5MB). Image binary data is never stored in PostgreSQL.

### 3. Database setup

```bash
npm run db:push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default admin credentials (from seed):**
- Username: `admin`
- Password: `admin123`

Change the admin password immediately in production.

## Deployment

### Vercel

1. Push to GitHub and import into [Vercel](https://vercel.com)
2. Add all environment variables from `.env.example`
3. Set build command: `npm run build`
4. Deploy

### Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npm run db:push` (or `db:migrate` for production migrations)

### AWS S3

1. Create an S3 bucket with public read access for images (or use CloudFront)
2. Create IAM credentials with `s3:PutObject` and `s3:DeleteObject` permissions
3. Set `AWS_S3_PUBLIC_URL` to your bucket's public URL

## Security

- Password hashing with bcrypt (12 rounds)
- JWT sessions with 8-hour expiry
- Middleware-protected admin routes
- Role-based authorization (ADMIN only)
- Server-side Zod validation on all mutations
- Input sanitization
- In-memory rate limiting on login attempts
- CSRF-safe server actions (built into Next.js)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## License

Private project.
