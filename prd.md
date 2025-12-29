# HOA Hub - Complete Product Requirements Document

## Executive Summary

**Product:** HOA Hub - Affordable HOA management for small communities
**Target Market:** HOAs with 10-200 units (condos, townhomes, single-family communities)
**Pricing Model:** Flat monthly fee ($29-99/mo based on features, NOT per-unit)
**Core Value Prop:** Modern, simple, affordable alternative to bloated enterprise solutions

---

## Technical Stack & Decisions

### Confirmed Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) | *Note: Next.js 16 isn't released yet - use 15* |
| Language | TypeScript | Strict mode enabled |
| API Layer | tRPC v11 | Type-safe API with React Query integration |
| Auth | Clerk | Handles auth, user management, orgs |
| Database | PostgreSQL (Neon) | Serverless, branching for dev |
| ORM | Prisma | Type-safe queries |
| Notifications | Novu | Multi-channel (email, in-app, push) |
| File Storage | Cloudflare R2 | S3-compatible, cheap egress |
| UI Components | shadcn/ui | Recommend over MUI - see below |
| Styling | Tailwind CSS | Utility-first |
| Deployment | Vercel | Edge functions, preview deploys |

### Technical Decisions to Make

#### 1. **shadcn/ui vs MUI**
**Recommendation: shadcn/ui**

| Factor | shadcn/ui | MUI |
|--------|-----------|-----|
| Bundle size | ~50KB | ~300KB+ |
| Customization | Full control (copy components) | Theme overrides |
| Tailwind integration | Native | Requires adapter |
| Learning curve | Lower | Higher |
| Component ownership | You own the code | Library dependency |
| tRPC/Server Components | Works great | Hydration issues |

**Verdict:** For a new project with Tailwind, shadcn is cleaner. You'll appreciate the smaller bundle and easier customization.

#### 2. **Form Handling**
```
react-hook-form + zod + @hookform/resolvers
```
- Share zod schemas between tRPC and forms
- Type-safe validation on client and server

#### 3. **File Upload Strategy**
```
Presigned URLs approach:
1. Client requests upload URL from tRPC
2. tRPC generates presigned R2 URL
3. Client uploads directly to R2
4. Client confirms upload, saves URL to DB
```
Use `@uppy/core` + `@uppy/xhr-upload` for robust uploads with progress.

#### 4. **Background Jobs**
```
Vercel Cron + Inngest (or Trigger.dev)
```
For: Late payment reminders, digest emails, cleanup tasks

#### 5. **State Management**
```
tRPC + React Query (built-in) - no Redux needed
Zustand for UI state (modals, sidebar)
```

#### 6. **Error Monitoring**
```
Sentry (free tier sufficient for MVP)
```

#### 7. **Email Templates**
```
React Email + Resend (Novu uses Resend as provider)
```

#### 8. **Testing Strategy (Post-MVP)**
```
Vitest + React Testing Library + Playwright
```

---

## User Roles & Permissions

### Role Definitions

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Community creator, billing owner | Full access + billing |
| **Admin** | Board members, property managers | Full access except billing |
| **Resident** | Homeowners and tenants | Own unit + community info |

### Permission Matrix

| Action | Super Admin | Admin | Resident |
|--------|-------------|-------|----------|
| Manage billing/subscription | ✅ | ❌ | ❌ |
| Manage admins | ✅ | ❌ | ❌ |
| Manage units | ✅ | ✅ | ❌ |
| Invite residents | ✅ | ✅ | ❌ |
| Log payments | ✅ | ✅ | ❌ |
| Create violations | ✅ | ✅ | ❌ |
| Manage maintenance requests | ✅ | ✅ | ❌ |
| Post announcements | ✅ | ✅ | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| View all units/residents | ✅ | ✅ | Directory only |
| View own account | ✅ | ✅ | ✅ |
| Submit maintenance request | ✅ | ✅ | ✅ |
| Respond to violations | ✅ | ✅ | ✅ (own) |
| Update own profile | ✅ | ✅ | ✅ |

---

## MVP Features & Specifications

### 1. Authentication & Onboarding

#### Clerk Configuration
```typescript
// Use Clerk Organizations for multi-community support
// Each community = 1 Clerk Organization
// Roles stored in Clerk org membership metadata

// publicMetadata on org membership:
{
  role: "SUPER_ADMIN" | "ADMIN" | "RESIDENT",
  unitId: string | null
}
```

#### Onboarding Flows

**Admin Onboarding:**
```
1. Sign up with Clerk
2. Create Community wizard:
   - Community name
   - Address
   - Assessment amount & frequency
   - Logo upload (optional)
3. Clerk org created automatically
4. Redirect to dashboard with setup checklist
```

**Resident Onboarding:**
```
1. Receive email invitation (via Novu)
2. Click link → /invite/[token]
3. Sign up/sign in with Clerk
4. Auto-joined to community org
5. Linked to their unit
6. Redirect to resident dashboard
```

---

### 2. Dashboard

#### Admin Dashboard Components

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, [Name]                        [+ Quick Add ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │ Outstanding │ │    Open     │ │  Pending    │ │ Active ││
│  │    Dues     │ │ Violations  │ │  Requests   │ │ Units  ││
│  │   $4,250    │ │      3      │ │      7      │ │   42   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
│                                                             │
│  Recent Activity                    Announcements           │
│  ┌─────────────────────────────┐   ┌───────────────────────┐│
│  │ • Payment: Unit 12 - $150   │   │ 📌 Board Meeting 1/15 ││
│  │ • Violation: Unit 5 opened  │   │ • Pool closes for...  ││
│  │ • Request: Unit 23 submitted│   │ • Trash pickup change ││
│  └─────────────────────────────┘   └───────────────────────┘│
│                                                             │
│  Setup Checklist (if incomplete)                            │
│  ☑ Create community  ☐ Add units  ☐ Invite residents       │
└─────────────────────────────────────────────────────────────┘
```

#### Resident Dashboard Components

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome, [Name]                              Unit 12A      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Account Summary                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Current Balance: $150.00                    [Pay Now] ││
│  │  Next Due: $150.00 on Feb 1, 2025                      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │ My Requests │ │   Alerts    │                           │
│  │      2      │ │      1      │  ← violation notice       │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
│  Community Announcements                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📌 Board Meeting January 15th                          ││
│  │ Pool closing for maintenance Dec 20-22                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Submit Maintenance Request]  [View Documents]             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Units Management

#### Unit List View (Admin)
- Table with: Address, Owner, Balance, Status, Actions
- Filters: Balance (all, paid, overdue), Status (occupied, vacant)
- Search by address or resident name
- Bulk actions: Export CSV, Send reminders

#### Unit Detail View (Admin)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Units                                            │
│                                                             │
│  Unit 12A - 123 Oak Street                     [Edit Unit]  │
│                                                             │
│  Tabs: [Overview] [Ledger] [Violations] [Requests]          │
├─────────────────────────────────────────────────────────────┤
│  Overview Tab:                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Owner               │  │ Tenant (if any)     │          │
│  │ John Smith          │  │ -                   │          │
│  │ john@email.com      │  │                     │          │
│  │ (555) 123-4567      │  │ [Add Tenant]        │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  Current Balance: $300.00 (2 months overdue)               │
│  [Log Payment]  [Send Reminder]                             │
└─────────────────────────────────────────────────────────────┘
```

#### Unit Data Model Fields
- Address (required)
- Owner name, email, phone
- Tenant name, email, phone (optional)
- Move-in date
- Notes (admin only)
- Status: Active, Vacant, Delinquent

---

### 4. Dues & Payments

#### Assessment Configuration (Settings)
```typescript
{
  amount: number,           // e.g., 150.00
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUAL",
  dueDay: number,          // Day of month (1-28)
  gracePeriodDays: number, // Days before considered late
  lateFeeAmount: number,   // Optional late fee
}
```

#### Payment Logging (Admin)
```
Form Fields:
- Unit (searchable dropdown)
- Amount
- Date received
- Method: Check, Cash, Bank Transfer, Other
- Check/Reference number (optional)
- Notes (optional)
- Apply to: Current balance / Specific period
```

#### Ledger View (per Unit)
```
┌──────────────────────────────────────────────────────────────┐
│  Unit 12A - Financial Ledger                    [Export CSV] │
├──────────────────────────────────────────────────────────────┤
│  Date       │ Description          │ Charge  │ Payment │ Bal │
│  ─────────────────────────────────────────────────────────── │
│  01/01/25   │ Jan Assessment       │ $150    │         │$150 │
│  01/05/25   │ Payment - Check #123 │         │ $150    │ $0  │
│  02/01/25   │ Feb Assessment       │ $150    │         │$150 │
│  02/01/25   │ Violation Fine #42   │ $50     │         │$200 │
└──────────────────────────────────────────────────────────────┘
```

---

### 5. Violations Management

#### Violation Statuses & Workflow

```
┌────────┐    ┌──────────────┐    ┌──────────┐    ┌────────┐
│  OPEN  │───▶│ ACKNOWLEDGED │───▶│ RESOLVED │───▶│ CLOSED │
└────────┘    └──────────────┘    └──────────┘    └────────┘
     │                                                  ▲
     └──────────────────────────────────────────────────┘
                    (Admin can close directly)
```

| Status | Description | Who Changes |
|--------|-------------|-------------|
| OPEN | Newly created, resident notified | Admin creates |
| ACKNOWLEDGED | Resident has seen/responded | Resident or auto after view |
| RESOLVED | Resident claims fixed, pending verification | Resident |
| CLOSED | Admin verified resolution or waived | Admin |

#### Create Violation Form
```
- Unit (required, searchable)
- Violation Type (dropdown):
  - Parking, Landscaping, Exterior Maintenance,
  - Noise, Trash, Pet, Architectural, Other
- Title (required)
- Description (required, rich text)
- Photos (up to 5, drag & drop)
- Fine Amount (optional)
- Due Date for resolution (optional)
- Send notification (checkbox, default true)
```

#### Violation Detail View
```
┌─────────────────────────────────────────────────────────────┐
│  Violation #42 - Lawn Maintenance          Status: OPEN [▼] │
│  Unit 5 - 789 Pine Street                                   │
├─────────────────────────────────────────────────────────────┤
│  Created: Jan 5, 2025 by Admin Jane                         │
│  Due Date: Jan 20, 2025                                     │
│  Fine: $50.00 (Unpaid)                                      │
│                                                             │
│  Description:                                               │
│  Lawn has not been mowed in over 3 weeks. Per CC&R 4.2,    │
│  lawns must be maintained regularly.                        │
│                                                             │
│  Photos:                                                    │
│  [img1] [img2]                                              │
│                                                             │
│  ─────────────── Conversation ───────────────               │
│  │ Admin Jane (Jan 5): Please address within 2 weeks       │
│  │ Resident Bob (Jan 6): Will fix this weekend             │
│  │ Resident Bob (Jan 8): Completed, please verify          │
│  └──────────────────────────────────────────────────────── │
│                                                             │
│  [Add Response]                              [Mark as Paid] │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Maintenance Requests

#### Request Statuses & Workflow

```
┌───────────┐    ┌───────────┐    ┌─────────────┐    ┌───────────┐
│ SUBMITTED │───▶│ IN_REVIEW │───▶│ IN_PROGRESS │───▶│ COMPLETED │
└───────────┘    └───────────┘    └─────────────┘    └───────────┘
                       │                                   │
                       ▼                                   │
                 ┌──────────┐                              │
                 │ DECLINED │◀─────────────────────────────┘
                 └──────────┘     (if not HOA responsibility)
```

#### Submit Request Form (Resident)
```
- Title (required)
- Category (dropdown):
  - Common Area, Exterior, Plumbing, Electrical,
  - HVAC, Landscaping, Security, Other
- Description (required)
- Location details
- Photos (up to 5)
- Urgency: Low, Medium, High, Emergency
- Preferred contact method
- Available times (optional)
```

#### Request Management (Admin)
```
┌─────────────────────────────────────────────────────────────┐
│  Request #15 - Broken hallway light      Status: IN_REVIEW  │
│  Unit 23 - Common Area                                      │
├─────────────────────────────────────────────────────────────┤
│  Submitted: Jan 10, 2025 by Mary Johnson                    │
│  Urgency: Medium                                            │
│  Category: Electrical                                       │
│                                                             │
│  Description:                                               │
│  The light in the 2nd floor hallway near unit 23 has been  │
│  flickering for a week and now is completely out.          │
│                                                             │
│  ─────────────── Admin Notes (private) ───────────────      │
│  │ Called electrician, scheduled for Jan 12                │
│  └──────────────────────────────────────────────────────── │
│                                                             │
│  ─────────────── Updates (visible to resident) ───────     │
│  │ Jan 10: Request received, reviewing                     │
│  │ Jan 11: Electrician scheduled for tomorrow              │
│  └──────────────────────────────────────────────────────── │
│                                                             │
│  [Add Note]  [Add Update]  [Change Status ▼]                │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Announcements

#### Create Announcement
```
- Title (required)
- Content (rich text editor)
- Pin to top (checkbox)
- Send email notification (checkbox)
- Send to: All residents / Specific units
- Schedule for later (date/time picker) - Future feature
```

#### Announcement List
- Pinned items at top
- Sorted by date descending
- Shows: Title, preview, date, author
- Admin: Edit/Delete actions
- Resident: Read-only

---

### 8. Document Library

#### Folder Structure
```
Documents/
├── Governing Documents/
│   ├── CC&Rs
│   ├── Bylaws
│   └── Rules & Regulations
├── Meeting Minutes/
│   ├── 2025/
│   └── 2024/
├── Financial Reports/
│   ├── Budgets/
│   └── Statements/
├── Forms/
│   ├── Architectural Request
│   └── Move-in/Move-out
└── Other/
```

#### Upload Document (Admin)
```
- File (drag & drop, PDF/DOC/DOCX/XLS/XLSX)
- Name (auto-filled from filename, editable)
- Category (dropdown matching folders)
- Description (optional)
```

---

## Notification System (Novu)

### Notification Channels

| Channel | Use Case |
|---------|----------|
| **Email** | All notifications (primary) |
| **In-App** | Real-time alerts in dashboard |
| **Push** | Future: Mobile app |

### Notification Templates

#### 1. Resident Invitation
```
Trigger: Admin invites resident
Channel: Email
To: Invited email

Subject: You've been invited to join [Community Name] on HOA Hub

Body:
Hi [Name],

[Admin Name] has invited you to join [Community Name]'s
resident portal on HOA Hub.

Click below to create your account and access:
- Your account balance and payment history
- Community announcements
- Submit maintenance requests
- Important documents

[Accept Invitation Button]

This invitation expires in 7 days.
```

#### 2. Payment Received
```
Trigger: Admin logs payment
Channel: Email + In-App
To: Unit residents

Subject: Payment Received - [Community Name]

Body:
Hi [Name],

We've received your payment of $[Amount] on [Date].

Payment Details:
- Amount: $[Amount]
- Method: [Method]
- Reference: [Reference]
- New Balance: $[Balance]

Thank you!
```

#### 3. Payment Reminder
```
Trigger: Manual by admin OR automated (cron)
Channel: Email
To: Units with balance > 0

Subject: Payment Reminder - $[Amount] Due

Body:
Hi [Name],

This is a friendly reminder that your HOA assessment
of $[Amount] is due on [Due Date].

Current Balance: $[Balance]

To make a payment, please contact the HOA board or
mail a check to: [Address]

Questions? Reply to this email.
```

#### 4. Violation Created
```
Trigger: Admin creates violation
Channel: Email + In-App
To: Unit residents

Subject: HOA Violation Notice - [Violation Type]

Body:
Hi [Name],

A violation notice has been issued for your unit.

Violation: [Title]
Type: [Type]
Fine: $[Amount] (if applicable)
Resolution Due: [Date]

Details:
[Description]

Please log in to view photos and respond:
[View Violation Button]

If you have questions, please respond to this notice
through the portal.
```

#### 5. Violation Status Update
```
Trigger: Status change
Channel: Email + In-App
To: Unit residents + Admin who created

Subject: Violation Update - [Title]

Body:
The status of violation "[Title]" has been updated.

Previous Status: [Old Status]
New Status: [New Status]
Updated By: [Name]

[View Violation Button]
```

#### 6. Violation Response
```
Trigger: Resident or admin adds response
Channel: Email + In-App
To: Other party (admin if resident responded, vice versa)

Subject: New Response on Violation - [Title]

Body:
[Name] has responded to the violation "[Title]":

"[Response preview...]"

[View Full Response Button]
```

#### 7. Maintenance Request Submitted
```
Trigger: Resident submits request
Channel: Email + In-App
To: All admins

Subject: New Maintenance Request - [Title]

Body:
A new maintenance request has been submitted.

From: [Resident Name] - Unit [Unit]
Category: [Category]
Urgency: [Urgency]
Title: [Title]

Description:
[Description preview...]

[View Request Button]
```

#### 8. Maintenance Request Update
```
Trigger: Status change or admin adds update
Channel: Email + In-App
To: Requesting resident

Subject: Update on Your Maintenance Request - [Title]

Body:
Hi [Name],

There's an update on your maintenance request.

Request: [Title]
Status: [Status]

Update:
[Update message]

[View Request Button]
```

#### 9. New Announcement
```
Trigger: Admin posts announcement with email enabled
Channel: Email + In-App
To: All residents (or selected)

Subject: [Community Name]: [Announcement Title]

Body:
[Full announcement content]

---
Posted by [Admin Name] on [Date]

[View in Portal Button]
```

#### 10. New Document Uploaded
```
Trigger: Admin uploads document
Channel: In-App only (no email)
To: All residents

In-App Message:
New document uploaded: [Document Name] in [Category]
```

### Notification Preferences (Resident Settings)

```typescript
{
  email: {
    payments: true,
    violations: true,
    maintenance: true,
    announcements: true,
    documents: false,
  },
  inApp: {
    // Always enabled for critical items
  }
}
```

---

## Complete Page Structure

### Public Routes (Unauthenticated)
```
/                       → Marketing landing page
/pricing                → Pricing page
/login                  → Clerk sign-in
/signup                 → Clerk sign-up (creates admin)
/invite/[token]         → Resident invitation acceptance
```

### Admin Routes
```
/dashboard                    → Admin dashboard
/units                        → Unit list with filters
/units/new                    → Create unit form
/units/[id]                   → Unit detail (tabbed: overview, ledger, violations, requests)
/units/[id]/edit              → Edit unit form
/residents                    → Resident directory
/residents/[id]               → Resident profile
/dues                         → Payment overview, bulk operations
/dues/log                     → Log payment form
/violations                   → Violation list with filters
/violations/new               → Create violation form
/violations/[id]              → Violation detail & conversation
/maintenance                  → All maintenance requests
/maintenance/[id]             → Request detail & management
/announcements                → Announcement list
/announcements/new            → Create announcement
/announcements/[id]           → View/edit announcement
/documents                    → Document library
/documents/upload             → Upload document
/settings                     → Community settings
/settings/team                → Manage admins
/settings/billing             → Subscription (Super Admin only)
/settings/assessments         → Configure dues
/settings/invitations         → Pending invitations
```

### Resident Routes
```
/dashboard                    → Resident dashboard
/account                      → My balance & payment history
/violations                   → My violations
/violations/[id]              → Violation detail & respond
/maintenance                  → My maintenance requests
/maintenance/new              → Submit new request
/maintenance/[id]             → Request detail & updates
/announcements                → Community announcements
/announcements/[id]           → View announcement
/documents                    → Document library (read-only)
/directory                    → Resident directory
/profile                      → My profile & notification settings
```

---

## Data Models (Complete Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum Role {
  SUPER_ADMIN
  ADMIN
  RESIDENT
}

enum AssessmentFrequency {
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum ViolationStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
  CLOSED
}

enum ViolationType {
  PARKING
  LANDSCAPING
  EXTERIOR_MAINTENANCE
  NOISE
  TRASH
  PET
  ARCHITECTURAL
  OTHER
}

enum MaintenanceStatus {
  SUBMITTED
  IN_REVIEW
  IN_PROGRESS
  COMPLETED
  DECLINED
}

enum MaintenanceCategory {
  COMMON_AREA
  EXTERIOR
  PLUMBING
  ELECTRICAL
  HVAC
  LANDSCAPING
  SECURITY
  OTHER
}

enum Urgency {
  LOW
  MEDIUM
  HIGH
  EMERGENCY
}

enum PaymentMethod {
  CHECK
  CASH
  BANK_TRANSFER
  ONLINE
  OTHER
}

enum LedgerEntryType {
  ASSESSMENT
  LATE_FEE
  VIOLATION_FINE
  SPECIAL_ASSESSMENT
  PAYMENT
  CREDIT
  ADJUSTMENT
}

// ============================================
// CORE MODELS
// ============================================

model Community {
  id                    String               @id @default(cuid())
  clerkOrgId            String               @unique // Clerk organization ID
  name                  String
  address               String?
  city                  String?
  state                 String?
  zip                   String?
  logo                  String?              // R2 URL

  // Assessment configuration
  assessmentAmount      Decimal?             @db.Decimal(10, 2)
  assessmentFrequency   AssessmentFrequency  @default(MONTHLY)
  assessmentDueDay      Int                  @default(1) // 1-28
  gracePeriodDays       Int                  @default(15)
  lateFeeAmount         Decimal?             @db.Decimal(10, 2)

  createdAt             DateTime             @default(now())
  updatedAt             DateTime             @updatedAt

  // Relations
  units                 Unit[]
  users                 User[]
  announcements         Announcement[]
  documents             Document[]
  documentFolders       DocumentFolder[]
  invitations           Invitation[]

  @@index([clerkOrgId])
}

model User {
  id              String    @id @default(cuid())
  clerkUserId     String    @unique
  email           String
  firstName       String
  lastName        String
  phone           String?
  avatarUrl       String?
  role            Role

  // Notification preferences
  emailPayments       Boolean @default(true)
  emailViolations     Boolean @default(true)
  emailMaintenance    Boolean @default(true)
  emailAnnouncements  Boolean @default(true)

  communityId     String
  community       Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  unitId          String?   // null for admins
  unit            Unit?     @relation(fields: [unitId], references: [id], onDelete: SetNull)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations - created by this user
  createdViolations       Violation[]          @relation("ViolationCreator")
  violationResponses      ViolationResponse[]
  createdRequests         MaintenanceRequest[] @relation("RequestCreator")
  maintenanceUpdates      MaintenanceUpdate[]
  createdAnnouncements    Announcement[]
  createdDocuments        Document[]
  loggedPayments          LedgerEntry[]        @relation("PaymentLogger")

  @@unique([clerkUserId, communityId])
  @@index([communityId])
  @@index([unitId])
}

model Unit {
  id              String    @id @default(cuid())
  address         String    // Full address or unit number
  communityId     String
  community       Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  // Owner info (may or may not be a registered user)
  ownerName       String?
  ownerEmail      String?
  ownerPhone      String?

  // Tenant info (optional)
  tenantName      String?
  tenantEmail     String?
  tenantPhone     String?

  moveInDate      DateTime?
  notes           String?   // Admin notes
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  residents           User[]
  ledgerEntries       LedgerEntry[]
  violations          Violation[]
  maintenanceRequests MaintenanceRequest[]

  @@unique([communityId, address])
  @@index([communityId])
}

// ============================================
// FINANCIAL MODELS
// ============================================

model LedgerEntry {
  id              String          @id @default(cuid())
  unitId          String
  unit            Unit            @relation(fields: [unitId], references: [id], onDelete: Cascade)

  type            LedgerEntryType
  amount          Decimal         @db.Decimal(10, 2) // Positive for charges, negative for payments
  description     String
  date            DateTime        @default(now())

  // For payments
  paymentMethod   PaymentMethod?
  referenceNumber String?         // Check number, transaction ID, etc.

  // For violation fines
  violationId     String?
  violation       Violation?      @relation(fields: [violationId], references: [id], onDelete: SetNull)

  notes           String?

  createdById     String
  createdBy       User            @relation("PaymentLogger", fields: [createdById], references: [id])
  createdAt       DateTime        @default(now())

  @@index([unitId])
  @@index([date])
}

// ============================================
// VIOLATION MODELS
// ============================================

model Violation {
  id              String           @id @default(cuid())
  unitId          String
  unit            Unit             @relation(fields: [unitId], references: [id], onDelete: Cascade)

  type            ViolationType
  title           String
  description     String           @db.Text
  photos          String[]         // R2 URLs

  status          ViolationStatus  @default(OPEN)
  fineAmount      Decimal?         @db.Decimal(10, 2)
  dueDate         DateTime?

  createdById     String
  createdBy       User             @relation("ViolationCreator", fields: [createdById], references: [id])
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  closedAt        DateTime?

  // Relations
  responses       ViolationResponse[]
  ledgerEntries   LedgerEntry[]    // Fine entries

  @@index([unitId])
  @@index([status])
  @@index([createdAt])
}

model ViolationResponse {
  id              String    @id @default(cuid())
  violationId     String
  violation       Violation @relation(fields: [violationId], references: [id], onDelete: Cascade)

  userId          String
  user            User      @relation(fields: [userId], references: [id])

  message         String    @db.Text
  attachments     String[]  // R2 URLs

  createdAt       DateTime  @default(now())

  @@index([violationId])
}

// ============================================
// MAINTENANCE MODELS
// ============================================

model MaintenanceRequest {
  id              String              @id @default(cuid())
  unitId          String
  unit            Unit                @relation(fields: [unitId], references: [id], onDelete: Cascade)

  title           String
  description     String              @db.Text
  category        MaintenanceCategory
  urgency         Urgency             @default(MEDIUM)
  location        String?             // Specific location details
  photos          String[]            // R2 URLs

  status          MaintenanceStatus   @default(SUBMITTED)
  adminNotes      String?             @db.Text // Private notes for admins

  createdById     String
  createdBy       User                @relation("RequestCreator", fields: [createdById], references: [id])
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  completedAt     DateTime?

  // Relations
  updates         MaintenanceUpdate[]

  @@index([unitId])
  @@index([status])
  @@index([createdAt])
}

model MaintenanceUpdate {
  id              String             @id @default(cuid())
  requestId       String
  request         MaintenanceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  userId          String
  user            User               @relation(fields: [userId], references: [id])

  message         String             @db.Text
  isPublic        Boolean            @default(true) // false = admin-only note
  newStatus       MaintenanceStatus? // If status was changed

  createdAt       DateTime           @default(now())

  @@index([requestId])
}

// ============================================
// COMMUNICATION MODELS
// ============================================

model Announcement {
  id              String    @id @default(cuid())
  communityId     String
  community       Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  title           String
  content         String    @db.Text
  isPinned        Boolean   @default(false)

  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([communityId])
  @@index([createdAt])
}

model DocumentFolder {
  id              String     @id @default(cuid())
  communityId     String
  community       Community  @relation(fields: [communityId], references: [id], onDelete: Cascade)

  name            String
  parentId        String?
  parent          DocumentFolder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children        DocumentFolder[] @relation("FolderHierarchy")

  documents       Document[]

  createdAt       DateTime  @default(now())

  @@unique([communityId, name, parentId])
  @@index([communityId])
}

model Document {
  id              String          @id @default(cuid())
  communityId     String
  community       Community       @relation(fields: [communityId], references: [id], onDelete: Cascade)

  folderId        String?
  folder          DocumentFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)

  name            String
  description     String?
  fileUrl         String          // R2 URL
  fileType        String          // MIME type
  fileSize        Int             // Bytes

  createdById     String
  createdBy       User            @relation(fields: [createdById], references: [id])
  createdAt       DateTime        @default(now())

  @@index([communityId])
  @@index([folderId])
}

// ============================================
// INVITATION MODEL
// ============================================

model Invitation {
  id              String    @id @default(cuid())
  communityId     String
  community       Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  email           String
  unitId          String
  token           String    @unique @default(cuid())

  expiresAt       DateTime
  acceptedAt      DateTime?

  createdAt       DateTime  @default(now())

  @@unique([communityId, email])
  @@index([token])
}
```

---

## API Structure (tRPC Routers)

```typescript
// src/server/routers/_app.ts

export const appRouter = router({
  // Auth & User
  auth: authRouter,           // getCurrentUser, updateProfile, updateNotificationPrefs

  // Community
  community: communityRouter, // get, update, getSettings, updateSettings

  // Units
  units: unitsRouter,         // list, get, create, update, delete, getBalance

  // Users/Residents
  users: usersRouter,         // list, get, invite, resendInvite, removeFromCommunity

  // Financial
  ledger: ledgerRouter,       // getByUnit, createEntry, getOutstandingBalances

  // Violations
  violations: violationsRouter, // list, get, create, update, addResponse, changeStatus

  // Maintenance
  maintenance: maintenanceRouter, // list, get, create, addUpdate, changeStatus

  // Announcements
  announcements: announcementsRouter, // list, get, create, update, delete

  // Documents
  documents: documentsRouter, // listFolders, listDocuments, createFolder, upload, delete

  // File uploads
  uploads: uploadsRouter,     // getPresignedUrl, confirmUpload

  // Dashboard
  dashboard: dashboardRouter, // getAdminStats, getResidentSummary, getRecentActivity
});
```

---

## Build Order & Sprint Plan

### Sprint 1: Foundation (Week 1)
```
□ Project setup (Next.js, tRPC, Prisma, Tailwind, shadcn)
□ Clerk integration with organizations
□ Database schema & migrations
□ Basic layout (sidebar, header, responsive shell)
□ Auth middleware & role guards
□ Community creation flow
```

### Sprint 2: Core Data (Week 2)
```
□ Units CRUD (list, create, edit, delete)
□ Unit detail page (overview tab)
□ User/resident management
□ Invitation system (create, send, accept)
□ Resident directory
```

### Sprint 3: Financial (Week 3)
```
□ Ledger model & queries
□ Payment logging form
□ Unit ledger view (tab)
□ Outstanding balances dashboard widget
□ Payment reminder (manual trigger)
□ CSV export
```

### Sprint 4: Violations (Week 4)
```
□ Violation CRUD
□ Photo upload (R2 integration)
□ Violation detail & conversation
□ Status workflow
□ Fine tracking in ledger
□ Resident violation view
```

### Sprint 5: Maintenance & Comms (Week 5)
```
□ Maintenance request CRUD
□ Request submission (resident)
□ Admin management view
□ Updates & status changes
□ Announcements CRUD
□ Document library & upload
```

### Sprint 6: Notifications & Polish (Week 6)
```
□ Novu integration
□ All notification templates
□ In-app notification center
□ Dashboard widgets (both roles)
□ Settings pages
□ Error handling & loading states
□ Mobile responsiveness pass
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── invite/[token]/
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + header shell
│   │   ├── dashboard/
│   │   ├── units/
│   │   │   ├── page.tsx          # List
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detail (tabbed)
│   │   │       └── edit/
│   │   ├── residents/
│   │   ├── dues/
│   │   ├── violations/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── maintenance/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── announcements/
│   │   ├── documents/
│   │   ├── directory/
│   │   ├── account/              # Resident only
│   │   ├── profile/
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── team/
│   │       ├── billing/
│   │       ├── assessments/
│   │       └── invitations/
│   ├── api/
│   │   └── trpc/[trpc]/
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn components
│   ├── forms/
│   │   ├── unit-form.tsx
│   │   ├── violation-form.tsx
│   │   ├── maintenance-form.tsx
│   │   ├── payment-form.tsx
│   │   └── announcement-form.tsx
│   ├── tables/
│   │   ├── units-table.tsx
│   │   ├── violations-table.tsx
│   │   └── maintenance-table.tsx
│   ├── dashboard/
│   │   ├── admin-stats.tsx
│   │   ├── resident-summary.tsx
│   │   └── recent-activity.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       ├── file-upload.tsx
│       ├── status-badge.tsx
│       ├── data-table.tsx
│       └── empty-state.tsx
├── server/
│   ├── routers/
│   │   ├── _app.ts
│   │   ├── auth.ts
│   │   ├── community.ts
│   │   ├── units.ts
│   │   ├── users.ts
│   │   ├── ledger.ts
│   │   ├── violations.ts
│   │   ├── maintenance.ts
│   │   ├── announcements.ts
│   │   ├── documents.ts
│   │   ├── uploads.ts
│   │   └── dashboard.ts
│   ├── trpc.ts
│   └── db.ts
├── lib/
│   ├── novu.ts                   # Novu client
│   ├── r2.ts                     # R2 client
│   ├── utils.ts
│   └── validators/               # Zod schemas
│       ├── unit.ts
│       ├── violation.ts
│       └── maintenance.ts
├── hooks/
│   ├── use-user.ts
│   ├── use-community.ts
│   └── use-upload.ts
└── types/
    └── index.ts
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"

# Cloudflare R2
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="hoa-hub"
R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://assets.hoahub.com"

# Novu
NOVU_API_KEY="..."
NEXT_PUBLIC_NOVU_APP_ID="..."

# App
NEXT_PUBLIC_APP_URL="https://app.hoahub.com"
```
