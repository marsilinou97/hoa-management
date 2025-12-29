# HOA Hub - MVP Implementation Plan

## Overview
Building an affordable HOA management system for small communities (10-200 units). Focus on clean, DRY, production-ready code following senior engineer best practices.

---

## Phase 0: Cleanup & Foundation Setup

### 0.1 Repository Cleanup
- [ ] Remove example/demo code (posts pages, Posts component, posts router)
- [ ] Remove unused public assets (hero.png, unnecessary logos)
- [ ] Update README.md for HOA Hub project
- [ ] Update package.json metadata

### 0.2 Core Dependencies
- [ ] Install shadcn/ui CLI and initialize
- [ ] Install form handling: `react-hook-form`, `@hookform/resolvers`
- [ ] Install Prisma client and configure
- [ ] Set up environment variables template
- [ ] Configure TypeScript strict mode

### 0.3 Project Structure
- [ ] Create folder structure (lib/, components/, hooks/, types/)
- [ ] Set up tRPC router structure (server/routers/)
- [ ] Create Prisma schema with all models (from PRD)
- [ ] Configure lib/prisma.ts for database client
- [ ] Set up lib/utils.ts with cn() helper

**Deliverable:** Clean, organized project ready for development

---

## Phase 1: Auth & Community Foundation

### 1.1 Database Schema
- [ ] Implement complete Prisma schema from PRD
- [ ] Create initial migration
- [ ] Run migration and generate Prisma client
- [ ] Add seed script for development data (optional)

### 1.2 Clerk Integration & Middleware
- [ ] Configure Clerk middleware with org support
- [ ] Create tRPC context with Clerk auth
- [ ] Implement role-based guards/helpers
- [ ] Create auth router (getCurrentUser, updateProfile)

### 1.3 Base Layout & UI Components
- [ ] Install core shadcn components (button, card, input, form, etc.)
- [ ] Create app/(dashboard)/layout.tsx with sidebar + header
- [ ] Build Sidebar component with navigation
- [ ] Build Header component with user menu
- [ ] Implement mobile navigation
- [ ] Create role-based navigation logic

### 1.4 Community Creation Flow
- [ ] Create community router (tRPC)
- [ ] Build onboarding wizard UI
- [ ] Implement Clerk org creation
- [ ] Sync Community model with Clerk org
- [ ] Redirect to dashboard after setup

**Deliverable:** Auth working, users can create communities, basic layout in place

---

## Phase 2: Units & Residents Management

### 2.1 Units CRUD
- [ ] Create units tRPC router (list, get, create, update, delete)
- [ ] Create Zod validation schemas for Unit model
- [ ] Build /units page with data table
- [ ] Implement search and filters (balance, status)
- [ ] Create /units/new page with form
- [ ] Create /units/[id]/edit page

### 2.2 Unit Details
- [ ] Build /units/[id] page with tabs
- [ ] Implement Overview tab (owner/tenant info, balance)
- [ ] Create balance calculation utility
- [ ] Add quick actions (log payment, send reminder)

### 2.3 Invitation System
- [ ] Create invitations tRPC router
- [ ] Build invite form (select unit, enter email)
- [ ] Generate unique invitation tokens
- [ ] Create /invite/[token] acceptance page
- [ ] Link user to unit and Clerk org on acceptance
- [ ] Handle expired invitations

### 2.4 Resident Directory
- [ ] Create users tRPC router
- [ ] Build /residents page with directory table
- [ ] Implement search by name/unit
- [ ] Create /residents/[id] profile view
- [ ] Add remove/edit resident actions

**Deliverable:** Full unit and resident management, invitation system working

---

## Phase 3: Financial System

### 3.1 Ledger Infrastructure
- [ ] Create ledger tRPC router
- [ ] Implement balance calculation logic
- [ ] Create utility functions for ledger operations
- [ ] Build Zod schemas for ledger entries

### 3.2 Payment Logging
- [ ] Create /dues page with outstanding balances
- [ ] Build payment logging form
- [ ] Implement ledger entry creation
- [ ] Auto-calculate new balance on payment
- [ ] Add payment history view

### 3.3 Assessment Configuration
- [ ] Create settings router for community config
- [ ] Build /settings/assessments page
- [ ] Implement assessment frequency settings
- [ ] Configure late fees and grace periods

### 3.4 Unit Ledger Tab
- [ ] Add Ledger tab to unit detail page
- [ ] Display ledger entries in table format
- [ ] Calculate running balance
- [ ] Add CSV export functionality
- [ ] Show payment history

### 3.5 Dashboard Financial Widgets
- [ ] Create dashboard router
- [ ] Build outstanding dues widget
- [ ] Calculate community-wide totals
- [ ] Add quick stats (total owed, units paid, etc.)

**Deliverable:** Complete financial tracking, payment logging, assessment configuration

---

## Phase 4: Violations Management

### 4.1 File Upload System (R2)
- [ ] Set up Cloudflare R2 client (lib/r2.ts)
- [ ] Create uploads router with presigned URLs
- [ ] Build file upload component with drag & drop
- [ ] Implement upload progress tracking
- [ ] Handle multiple file uploads

### 4.2 Violations CRUD
- [ ] Create violations tRPC router
- [ ] Build Zod schemas for violations
- [ ] Create /violations page with list/filters
- [ ] Build /violations/new form with photo upload
- [ ] Implement violation creation with fine

### 4.3 Violation Detail & Conversation
- [ ] Build /violations/[id] detail page
- [ ] Implement response/conversation system
- [ ] Add photo gallery display
- [ ] Create status change workflow
- [ ] Build response form

### 4.4 Fine Integration
- [ ] Auto-create ledger entry when fine added
- [ ] Link violation to ledger entry
- [ ] Add "Mark as Paid" functionality
- [ ] Update ledger on payment

### 4.5 Resident Violation View
- [ ] Filter violations by user's unit
- [ ] Show only relevant violations to residents
- [ ] Allow residents to respond
- [ ] Implement status updates

**Deliverable:** Full violation management with photos, conversations, and fine tracking

---

## Phase 5: Maintenance & Communications

### 5.1 Maintenance Requests
- [ ] Create maintenance tRPC router
- [ ] Build Zod schemas for requests
- [ ] Create /maintenance/new (resident submission)
- [ ] Build /maintenance page (admin list view)
- [ ] Implement urgency-based sorting

### 5.2 Request Management
- [ ] Build /maintenance/[id] detail page
- [ ] Implement status workflow
- [ ] Create admin notes (private)
- [ ] Build public updates system
- [ ] Add status change tracking

### 5.3 Announcements
- [ ] Create announcements tRPC router
- [ ] Build /announcements page
- [ ] Create /announcements/new form
- [ ] Implement pin/unpin functionality
- [ ] Add rich text editor for content

### 5.4 Document Library
- [ ] Create documents router
- [ ] Build folder structure system
- [ ] Create /documents page with folder navigation
- [ ] Implement file upload
- [ ] Add file type/size validation
- [ ] Build search/filter functionality

**Deliverable:** Maintenance requests, announcements, and document management

---

## Phase 6: Notifications & Dashboard

### 6.1 Novu Integration
- [ ] Set up Novu account and API keys
- [ ] Configure Novu client (lib/novu.ts)
- [ ] Create notification helper functions
- [ ] Set up email provider (Resend)

### 6.2 Notification Templates
- [ ] Create all 10 email templates (React Email)
- [ ] Implement invitation email
- [ ] Add payment received notification
- [ ] Create violation notifications
- [ ] Build maintenance request notifications
- [ ] Add announcement notifications

### 6.3 In-App Notifications
- [ ] Build notification center component
- [ ] Implement real-time notification display
- [ ] Add mark as read functionality
- [ ] Create notification preferences page

### 6.4 Admin Dashboard
- [ ] Build dashboard stats widgets
- [ ] Create recent activity feed
- [ ] Add setup checklist for new communities
- [ ] Implement quick actions dropdown

### 6.5 Resident Dashboard
- [ ] Build resident account summary widget
- [ ] Show balance and next due date
- [ ] Display my requests/violations counts
- [ ] Show community announcements feed

**Deliverable:** Complete notification system, polished dashboards

---

## Phase 7: Settings & Polish

### 7.1 Settings Pages
- [ ] Create /settings main page
- [ ] Build /settings/team (manage admins)
- [ ] Implement /settings/billing (future: Stripe)
- [ ] Create /settings/invitations (pending list)
- [ ] Add community profile settings

### 7.2 User Profile
- [ ] Build /profile page
- [ ] Implement profile update form
- [ ] Add notification preferences
- [ ] Handle avatar upload

### 7.3 Error Handling
- [ ] Create error boundary components
- [ ] Add tRPC error handling
- [ ] Implement toast notifications
- [ ] Add loading states throughout
- [ ] Create empty state components

### 7.4 Responsive Design
- [ ] Mobile responsiveness pass on all pages
- [ ] Test tablet layouts
- [ ] Optimize for touch interactions
- [ ] Ensure tables work on mobile

### 7.5 Performance & SEO
- [ ] Optimize images
- [ ] Add proper metadata
- [ ] Implement page loading skeletons
- [ ] Add proper caching headers
- [ ] Run Lighthouse audit

**Deliverable:** Production-ready MVP with all settings, error handling, responsive design

---

## Phase 8: Testing & Deployment

### 8.1 Testing Setup (Optional for MVP)
- [ ] Set up Vitest
- [ ] Add unit tests for critical utils
- [ ] Test tRPC procedures
- [ ] Add E2E tests for critical flows

### 8.2 Deployment
- [ ] Set up Neon database (production)
- [ ] Configure Vercel project
- [ ] Set environment variables
- [ ] Run production migration
- [ ] Deploy to Vercel
- [ ] Set up custom domain

### 8.3 Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel analytics
- [ ] Add logging for critical operations
- [ ] Set up uptime monitoring

**Deliverable:** Deployed, monitored production application

---

## Technical Standards

### Code Quality
- **DRY Principle:** Extract reusable components, utilities, and types
- **TypeScript:** Full type safety, no `any` types
- **Error Handling:** Proper try/catch, user-friendly error messages
- **Validation:** Zod schemas for all inputs
- **Security:** Sanitize inputs, validate permissions on every tRPC procedure

### Architecture Patterns
- **tRPC Procedures:** Always check auth, validate org membership
- **Database Queries:** Use Prisma transactions for multi-step operations
- **File Structure:** Co-locate related code, clear separation of concerns
- **Component Design:** Small, focused components with single responsibility
- **State Management:** React Query for server state, Zustand for UI state

### Performance Best Practices
- **Server Components:** Use by default, client components only when needed
- **Code Splitting:** Dynamic imports for heavy components
- **Database Indexes:** Proper indexing on frequently queried fields
- **Caching:** Leverage React Query caching, consider Redis for later

### Security Checklist
- [ ] All tRPC procedures check authentication
- [ ] Role-based authorization on every action
- [ ] SQL injection prevention via Prisma
- [ ] XSS prevention via proper escaping
- [ ] CSRF protection via Clerk
- [ ] File upload validation (type, size)
- [ ] Rate limiting on sensitive endpoints (future)

---

## Development Workflow

### Per Feature
1. **Plan:** Review requirements, identify dependencies
2. **Schema:** Update Prisma schema if needed, create migration
3. **Backend:** Create tRPC router, implement procedures with validation
4. **Frontend:** Build UI components, forms, pages
5. **Integration:** Connect frontend to tRPC, handle loading/error states
6. **Test:** Manual testing, edge cases, error scenarios
7. **Refactor:** DRY, extract common patterns, optimize
8. **Commit:** Clear, descriptive commit messages

### Git Strategy
- Feature branches from main
- Descriptive commit messages
- Squash merge to main
- Deploy main to production

---

## Success Metrics for MVP

### Functionality
- ✅ Admin can create community and invite residents
- ✅ Admin can manage units and log payments
- ✅ Admin can create violations and track responses
- ✅ Residents can submit maintenance requests
- ✅ All users receive email notifications
- ✅ Documents can be uploaded and organized
- ✅ Dashboards show relevant data for each role

### Technical
- ✅ 100% TypeScript coverage
- ✅ All forms validated with Zod
- ✅ Mobile responsive
- ✅ < 3s initial page load
- ✅ Zero TypeScript errors
- ✅ Deployed and accessible

### Code Quality
- ✅ Consistent code style
- ✅ No code duplication
- ✅ Proper error handling
- ✅ Clear component organization
- ✅ Documented complex logic

---

## Post-MVP Enhancements (Future)

### Phase 9: Payments Integration
- Stripe integration for online payments
- Payment portal for residents
- Automated recurring payments
- Payment history and receipts

### Phase 10: Advanced Features
- Automated late fees
- Email digests
- Advanced reporting (charts, graphs)
- Budget tracking
- Reserve fund management
- Work order management with contractor assignment

### Phase 11: Mobile App
- React Native mobile app
- Push notifications
- Mobile-optimized flows
- Offline support

---

## Estimated Timeline

- **Phase 0:** 1 day
- **Phase 1:** 3-4 days
- **Phase 2:** 4-5 days
- **Phase 3:** 4-5 days
- **Phase 4:** 5-6 days
- **Phase 5:** 5-6 days
- **Phase 6:** 4-5 days
- **Phase 7:** 3-4 days
- **Phase 8:** 2-3 days

**Total MVP:** ~4-6 weeks for focused development

---

## Next Steps

1. **Review this plan** and PRD for completeness
2. **Start Phase 0** - clean up repo and install dependencies
3. **Set up development environment** - database, Clerk, etc.
4. **Begin Phase 1** - implement auth and base layout
5. **Iterate through phases** sequentially
6. **Regular commits** and testing throughout
7. **Deploy early** and often to catch issues

---

**This plan is comprehensive yet focused on MVP. Each phase builds on the previous, ensuring a solid foundation before adding complexity. Follow senior engineering principles: clean code, proper abstractions, type safety, and security throughout.**
