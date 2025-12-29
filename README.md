# HOA Hub

Modern, affordable HOA management software for small to medium communities (10-200 units).

## Overview

HOA Hub provides an intuitive platform for homeowners associations to manage units, residents, dues, violations, maintenance requests, and community communications. Built with modern web technologies for reliability and ease of use.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **API:** tRPC v10
- **Auth:** Clerk (with Organizations)
- **Database:** PostgreSQL + Prisma ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Notifications:** Novu
- **File Storage:** Cloudflare R2
- **Deployment:** Vercel

## Features

### For Administrators
- Unit and resident management
- Payment tracking and ledger system
- Violation management with photos
- Maintenance request tracking
- Community announcements
- Document library
- Email notifications

### For Residents
- View account balance and payment history
- Submit maintenance requests
- Respond to violations
- Access community documents
- Receive announcements
- Manage notification preferences

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (recommend Neon for serverless)
- Clerk account for authentication
- Cloudflare account for R2 storage (optional for MVP)
- Novu account for notifications (optional for MVP)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoa-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   - Clerk API keys
   - Database URL
   - R2 credentials (optional)
   - Novu credentials (optional)

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth-related pages
│   ├── (dashboard)/       # Dashboard and main app pages
│   ├── api/               # API routes
│   └── server/            # tRPC server code
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── tables/           # Data table components
│   └── layout/           # Layout components
├── lib/                   # Utility functions and configs
├── prisma/               # Database schema and migrations
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Update Prisma schema if needed
   - Create/update tRPC routers
   - Build UI components
   - Test thoroughly

3. **Run type checking**
   ```bash
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

## Documentation

- [Product Requirements Document](./prd.md) - Complete feature specifications
- [Implementation Plan](./PLAN.md) - Phased development roadmap

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The app will automatically deploy on every push to main.

### Database Migrations

For production deployments, use Prisma migrations:

```bash
npx prisma migrate deploy
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes (dev only)
- `npx prisma migrate dev` - Create and apply migration

## Environment Variables

See `.env.example` for all required environment variables.

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Optional (for full features)
- `R2_*` - Cloudflare R2 configuration
- `NOVU_*` - Novu notification configuration
- `NEXT_PUBLIC_APP_URL` - App URL for emails/links

## Contributing

1. Follow TypeScript best practices
2. Use meaningful variable and function names
3. Write clean, DRY code
4. Validate all inputs with Zod
5. Handle errors gracefully
6. Test edge cases

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact: [your-contact-info]

---

**Built with ❤️ for HOA communities**
