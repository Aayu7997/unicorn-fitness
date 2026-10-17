# GYM ADMIN PANEL — MASTER UI/UX + FUNCTIONAL + LOGIC PROMPT
## For the existing Unicorn Fitness Club admin panel

Use this with:
- `CLAUDE.md` = product, architecture, engineering, security
- `UI_UX.md` = universal visual/UX rules
- `UI_UX_RESOURCES.md` = libraries, components, tools and research

This document is the gym-admin-specific product specification. Do not blindly rewrite the existing application. Inspect the current routes, components, database, APIs, authentication and permissions first.

---

## 1. CURRENT INFORMATION ARCHITECTURE

The existing sidebar contains:

OVERVIEW
- Dashboard
- Analytics

PEOPLE
- Members
- Trainers
- Inquiries

OPERATIONS
- Classes
- Inventory
- Master Settings

FINANCIALS
- Invoices
- Expenses
- Rep
CLIENT PROCESS
- Diet Plans
- Exercise Plans
- Measurements

WEBSITE CMS
- Site Content
- Programs
- Gallery
- Testimonials
- Blog
- FAQs

SYSTEM
- AI Assistant
- Communication
- SEO Config
- Ads
- Settings

ACCOUNT
- Admin profile
- Role
- Logout

Treat these as the existing product structure. Do not rename/remove/reorganize them without first identifying the UX/product reason and checking route, permission and data implications.

---

## 2. CORE PRODUCT STANDARD

Build this as a serious production gym-management SaaS used every day by staff.

It must feel:
- fast
- calm
- dense but readable
- trustworthy
- professional
- accessible
- responsive
- operationally efficient
- visually distinctive without being flashy

Do NOT turn it into a generic AI dashboard.

Avoid:
- excessive cards
- huge hero sections
- meaningless statistics
- generic purple/blue AI styling
- excessive gradients
- glassmorphism everywhere
- random icons
- excessive pills/badges
- unnecessary animations
- decorative charts
- giant whitespace
- template-like repeated three-card sections

Product workflows determine the UI.

---

## 3. APP SHELL

Desktop:
- persistent sidebar
- sensible page header
- optional breadcrumbs/context
- main workspace
- account area near bottom
- independent sidebar scrolling
- stable content width

Sidebar:
- consistent icon family
- clear active state
- 40–44px-ish normal row target
- 8–12px icon/text gap
- clear section labels
- compact but comfortable spacing
- subtle scrollbar
- logout visually separated
- keyboard accessible

Collapsed sidebar:
- icon-only
- tooltips
- preserved active state
- no layout jump

Mobile:
- drawer/sheet navigation
- compact header
- accessible touch targets
- do not squeeze desktop sidebar into the screen

---

## 4. PAGE HEADER

Normal admin pages should use:

Page title
Short useful description
Primary action
Secondary actions where needed

Example:
Members
Manage memberships, attendance and member information.
[Add Member] [Export]

Do not use marketing-style hero sections in operational pages.

---

## 5. GLOBAL UX

Provide, where useful:
- global search
- command menu
- notifications
- account menu
- breadcrumbs
- keyboard shortcuts

Global search should be capable of finding relevant:
members, trainers, classes, inquiries, invoices, diet plans, exercise plans, blog posts, programs, gallery items and FAQs.

Support:
idle, typing, loading, results, no results and error.

Use URL state for shareable filters/search/sort/pagination where useful.

Preserve browser back/forward behavior.

---

# MODULE SPECIFICATIONS

## 6. DASHBOARD

The dashboard answers:
“What needs my attention right now?”

Useful areas:
- active/new members
- expiring memberships
- today's attendance
- upcoming classes
- trainer availability
- pending inquiries
- unpaid/overdue invoices
- low inventory
- members needing plan/measurement updates
- operational warnings

Every metric must have context and a useful next action.

Avoid decorative charts.

Each widget supports:
loading, populated, empty, partial/error and permission-limited states.

One failed widget must not break the entire dashboard.

---

## 7. ANALYTICS

Possible analytics:
- member growth
- attendance
- retention
- membership status
- revenue
- expenses
- trainer utilization
- class utilization
- inquiry conversion
- inventory movement

Every visualization needs:
- clear period
- unit
- labels
- useful tooltip
- no-data state
- loading state
- error state

Date ranges:
Today, Yesterday, 7 days, 30 days, This month, Last month, Quarter, Custom.

Use the configured organization timezone.

---

## 8. MEMBERS

Support:
- create
- view
- edit
- archive/deactivate
- restore where appropriate
- search
- filter
- sort
- pagination
- export/import where needed
- membership
- attendance
- payments/invoices
- trainer
- diet plan
- exercise plan
- measurements
- notes
- communication
- history

List should prioritize:
name, status, contact, expiry, trainer, activity, payment state.

Useful filters:
active/inactive/expired/expiring, trainer, plan, payment status, date.

Member profile:
Identity → membership/status → overview → attendance → payments → plans → measurements → notes → communication → history.

Do not create one enormous form.

---

## 9. TRAINERS

Support:
- profile
- specialization
- contact
- availability
- assigned members
- classes
- workload
- status
- documents if required
- authorized compensation data

Prevent trainer scheduling conflicts.

---

## 10. INQUIRIES

Treat inquiries as a lead workflow:

New → Contacted → Follow-up → Trial Scheduled → Converted/Lost

Track:
- source
- contact
- interest
- assigned staff
- next follow-up
- due date
- notes
- communication history
- conversion status

Overdue follow-ups must be obvious.

---

## 11. CLASSES

Support:
- class
- category
- trainer
- schedule
- duration
- capacity
- location
- recurrence
- status
- enrolled members
- attendance
- waitlist where needed

Before saving detect:
- trainer conflict
- location conflict
- capacity problem
- invalid time/date
- duplicate schedule
- archived trainer/class

Never silently overwrite a conflicting booking.

---

## 12. ATTENDANCE

Support:
- class/member attendance
- present/absent
- late where useful
- date filters
- manual correction
- correction reason
- audit history

Attendance changes should be traceable.

---

## 13. INVENTORY

Track:
- item
- SKU
- category
- quantity
- unit
- minimum threshold
- supplier
- cost
- selling price where applicable
- location
- movement history

Movement types:
purchase, sale, adjustment, damage, loss, return, transfer.

Every adjustment records quantity, reason, actor and timestamp.

---

## 14. MASTER SETTINGS

Current areas:
- Organisation Details
- Manage Role
- Manage User
- Manage Plan
- Manage Tax
- Manage Batch
- AI Timezones
- Audit Trail
- Login History

Keep high-impact configuration visually separated from ordinary settings.

### Organisation
name, logo, address, contact, website, business information, timezone, currency, operating hours, branding.

### Roles
Use explicit RBAC permissions such as:
members.read
members.create
members.update
members.delete
invoices.read
invoices.create
settings.read
settings.update
audit.read
users.manage
roles.manage

UI hiding is NOT authorization. Server must enforce every permission.

### Users
invite, activate/deactivate, role, status, last login and security information as appropriate. Never expose passwords/secrets.

### Plans
Clearly distinguish membership plans from internal exercise/diet plans.

### Tax
tax name/rate/type/inclusive behavior/effective date. Never silently alter historical invoice calculations.

### Batches
Clearly define whether batches are cohorts/classes/program groups. Include dates, trainer, capacity, members and status.

### Timezone
Use organization timezone consistently for schedules, attendance, invoices, reports, communication and audit display.

---

## 15. AUDIT TRAIL

Track important mutations:
- actor
- role
- action
- entity
- entity ID
- timestamp
- before/after where appropriate
- reason where required
- correlation/request ID when useful
- device/IP metadata only when justified

Never log passwords, tokens or secrets.

Audit UI:
search, date filter, actor, action, entity, detail drawer/page and human-readable before/after diff.

Do not expose raw JSON as the primary UX.

---

## 16. LOGIN HISTORY

Show only justified security information:
- user
- time
- success/failure
- device/browser
- IP when appropriate
- security/session event

Respect privacy and permissions.

---

## 17. FINANCIALS

### Invoices
Support:
draft → issued → partially paid → paid
and terminal/alternative states such as void/cancelled/refunded.

Include:
member/customer, amount, currency, date, status, reference, payment history, export/print.

Do not casually delete financial records.

### Expenses
vendor, category, amount, tax, date, payment method, receipt, notes, approval state if required.

### Reports
report type, filters, date range, generate, loading, no-data, error and export.

Large reports should use background generation when needed.

---

## 18. CLIENT PROCESS

### Diet Plans
member, goals, meals, portions, schedule, notes, assigned user, dates, status, version/history.

### Exercise Plans
member, goals, exercises, sets, reps, duration, rest, frequency, trainer, dates, notes, version/history.

Do not silently overwrite important active plans.

### Measurements
Store historical measurement events instead of overwriting them.

Support:
date, value, unit, source, notes.

Use charts only when they help understand progress. Do not imply medical conclusions.

Protect sensitive personal data.

---

## 19. WEBSITE CMS

Areas:
Site Content, Programs, Gallery, Testimonials, Blog, FAQs.

Use content states:
Draft, Preview, Published, Scheduled, Archived where applicable.

### Site Content
structured sections, contact information, navigation/footer, CTAs and SEO metadata.

### Programs
title, description, category, duration, trainer, price if applicable, media, status, ordering, SEO and publish state.

### Gallery
upload, title/caption, alt text, category, ordering, visibility, delete/archive, optimized images.

### Testimonials
name, quote, image only with appropriate consent, rating if genuinely collected, source, status, featured state.

Never fabricate testimonials.

### Blog
draft, preview, publish, schedule, author, category, tags, cover image, SEO, slug, canonical URL, revision history.

### FAQs
question, answer, category, ordering, active state and structured data where appropriate.

Sanitize rich text. Validate uploads server-side.

---

## 20. AI ASSISTANT

AI can:
- summarize
- explain analytics
- draft communication
- draft CMS content
- find records
- assist with reports

AI cannot bypass authorization.

High-impact actions require explicit confirmation:
- delete
- refund
- role change
- pricing/tax changes
- publish
- bulk messaging
- mass data changes

Show exactly what will happen and what records are affected.

AI UX supports:
thinking/streaming, cancel, retry, error, copy, edit and regenerate.

Never fake AI progress.

---

## 21. COMMUNICATION

Support:
draft, scheduled, sending, sent, failed, cancelled.

Track channel, recipient, sender, time, status and provider reference where available.

Bulk messaging must show:
- audience count
- filters
- preview
- channel
- cost where relevant
- schedule
- compliance/opt-out implications

Require confirmation before sending.

---

## 22. SEO CONFIG

Support:
- title
- meta description
- canonical
- robots
- sitemap behavior
- Open Graph
- structured data
- redirects where appropriate

Protect admin routes from public indexing.

---

## 23. ADS

Support:
campaign, placement, creative, status, start/end, budget/targeting where applicable, preview.

Do not allow untrusted executable content.

---

# UNIVERSAL FUNCTIONAL RULES

## 24. CRUD STANDARD

Every CRUD module should handle:

List
Create
Read
Update
Archive/Delete where appropriate
Search
Filter
Sort
Pagination
Loading
Empty
Error
Permission denied
Validation
Success
Conflict where relevant

---

## 25. DELETE/ARCHIVE

Prefer archive/deactivate when history matters.

Hard delete only when:
- permitted
- dependencies are safe
- historical requirements are satisfied
- audit requirements are handled

Financial/audit records should normally remain immutable/history-preserving.

---

## 26. BULK ACTIONS

Use only for safe operations.

Show exact affected count:
“You are about to change 27 members.”

Destructive bulk actions require confirmation and appropriate permissions.

---

## 27. FILTERS/TABLES

Filters:
- clear
- resettable
- show active filters
- mobile-friendly
- URL-persisted where useful

Tables:
- sortable
- accessible
- stable columns
- row actions
- loading/empty/error states
- pagination
- selection where needed

Mobile must use an intentional strategy: horizontal scroll, priority columns, row detail or drawer.

---

## 28. FORMS

Every form has:
- labels
- required indication
- validation
- help text where useful
- loading
- disabled
- success
- errors
- unsaved-change handling

Client validation improves UX; server validation provides actual correctness/security.

Do not validate aggressively while users are still typing.

---

## 29. UNSAVED CHANGES

For explicit-save forms:
- Save
- Cancel
- Discard
- unsaved indicator

Warn before navigation when meaningful changes would be lost.

---

## 30. CONCURRENCY

Prevent silent overwrites.

Use version/updated-at checks or equivalent.

If another admin changed the record:
“This record was updated by another admin. Review the latest version before saving.”

---

## 31. ERROR RECOVERY

Every important error provides:
- understandable explanation
- retry/recovery
- preserved input where possible
- safe technical logging

Never show a dead-end “Something went wrong” with no next action.

---

## 32. LOADING / EMPTY / ERROR

Use:
- skeleton for known layouts
- spinner for short indeterminate operations
- progress for measurable long operations
- partial loading for independent sections

Every empty state explains:
what is empty + why + what to do next.

Distinguish “no records” from “no permission” without leaking sensitive existence information.

---

## 33. NETWORK

Handle:
- offline
- reconnecting
- timeout
- retry
- stale data
- failed save

Never silently lose form input.

---

## 34. DATA / API LOGIC

For every mutation:

authenticate
→ authorize
→ validate schema
→ validate business rules
→ transaction where required
→ audit
→ return safe result
→ update/invalidate client state

Use:
- foreign keys
- unique constraints
- check constraints
- indexes
- transactions
- timestamps
- appropriate archive/soft-delete strategy

Use idempotency/duplicate protection for payments, messages, imports and retryable jobs.

Rate-limit login, recovery, bulk communication, AI, expensive reports and exports where appropriate.

---

## 35. PERFORMANCE

The admin panel must feel fast.

Use:
- server-side pagination/filtering for large data
- debounced search
- caching where safe
- prefetching where justified
- lazy loading/code splitting
- optimized images
- virtualization only when justified

Do not load every module and dataset on initial page load.

---

## 36. SECURITY

Never trust:
- client-side roles
- hidden buttons
- localStorage permissions
- route visibility
- client-provided IDs
- client validation

Enforce authorization server-side.

Protect:
- financials
- roles
- users
- audit logs
- tax
- communication
- integrations
- AI actions
- personal member data

Minimize sensitive data exposure in URLs, logs, search previews, notifications and client debug output.

---

## 37. INDIAN GYM CONTEXT

If configured for India:
- INR formatting
- Indian phone formatting
- IST where configured
- GST/tax configuration where legally applicable
- common payment methods if integrated

Do not hardcode tax rates or legal assumptions.

---

## 38. DATE/TIME

Choose one consistent human-readable display format, e.g.:

29 Sep 2026
29 Sep 2026, 8:30 PM

Use organization timezone for business events.

Store timestamps consistently and convert for display.

---

## 39. UI/UX VISUAL RULES

Follow `UI_UX.md`.

For this admin panel specifically:
- serious dark interface is acceptable
- use multiple dark surfaces rather than pure black everywhere
- restrained borders
- strong typography hierarchy
- one coherent accent
- semantic status colors
- no excessive glow
- no cyberpunk/gaming aesthetic
- no excessive glass
- no giant cards
- no unnecessary gradients

Admin software should maximize useful workspace.

---

## 40. ICONS

Use one icon family, preferably Lucide if already compatible.

Suggested semantic mapping:
Dashboard → LayoutDashboard
Analytics → BarChart3
Members → Users
Trainers → UserRound
Inquiries → MessageSquare
Classes → Calendar
Inventory → Package
Master Settings → Settings
Invoices → Receipt
Expenses → Wallet/CreditCard
Reports → FileText/Chart
Diet Plans → Utensils
Exercise Plans → Dumbbell
Measurements → Ruler
Gallery → Images
Blog → FileText
FAQs → CircleHelp
AI Assistant → Bot/Sparkles
Communication → MessagesSquare/Globe
SEO → Search
Ads → Megaphone
Logout → LogOut

Verify installed icon names. Never mix icon families casually.

---

## 41. MOTION

CSS first for simple transitions.

Use Motion only for meaningful:
- layout transitions
- drawers/modals
- gestures
- complex state transitions

Starting ranges:
- micro 100–160ms
- normal 160–240ms
- panel/modal 200–320ms
- large layout 250–400ms

Prefer transform/opacity. Respect reduced motion.

---

## 42. RESPONSIVE QA

Test:
320, 375, 390, 430, 768, 1024, 1280, 1440, 1920+

Check:
sidebar, tables, forms, drawers, modals, typography, spacing, overflow, loading, empty, errors, keyboard, dark mode and motion.

---

## 43. ACCESSIBILITY

Support:
- keyboard navigation
- visible focus
- semantic HTML
- screen readers
- contrast
- reduced motion
- accessible dialogs
- accessible tables
- labelled forms
- associated errors
- focus restoration

Target WCAG 2.2 AA unless project requirements differ.

---

## 44. TESTING MATRIX

For each important module test:

Functional:
create/read/update/archive, search, filters, sorting, pagination.

States:
loading, empty, error, permission denied, success, conflict, offline where relevant.

Security:
wrong role, direct API request, manipulated IDs, unauthorized bulk action, mass-assignment attempts.

UX:
keyboard, mobile, long content, slow network, duplicate clicks.

---

## 45. VISUAL QA

After coding, run the actual application and inspect the rendered UI.

Do not trust source code alone.

Check:
- spacing
- alignment
- typography
- hierarchy
- icons
- tables
- forms
- overflow
- state transitions
- mobile
- desktop
- accessibility
- performance

Fix issues rather than merely reporting them.

---

## 46. AI IMPLEMENTATION WORKFLOW

Before changing anything:

1. Read `CLAUDE.md`.
2. Read `UI_UX.md`.
3. Read `UI_UX_RESOURCES.md`.
4. Inspect current implementation.
5. Inspect existing components/tokens.
6. Inspect routes/API/database contracts.
7. Inspect authentication/RBAC.
8. Identify affected user flows and states.
9. Reuse existing patterns.
10. Avoid new dependencies unless justified.
11. Implement the smallest coherent change.
12. Run typecheck/lint/tests.
13. Inspect actual browser UI.
14. Fix visual/functional/accessibility issues.
15. Re-test affected workflows.

Do not redesign unrelated parts.

---

## 47. RESOURCE RULE

Follow `UI_UX_RESOURCES.md`.

Preferred default candidates where compatible:
- Tailwind
- shadcn/ui
- ONE primitive foundation: Base UI OR Radix OR React Aria
- Lucide
- Motion only when justified
- Playwright
- axe-core
- Storybook when useful

Do not add multiple competing UI libraries, icon libraries or animation systems.

---

## 48. MODULE DEFINITION OF DONE

A module is NOT complete because it renders.

It is complete only when:

Information architecture
+ UI/UX
+ responsive behavior
+ accessibility
+ CRUD/business logic
+ validation
+ permissions
+ loading/empty/error states
+ auditability
+ performance
+ security
+ tests
+ visual QA

are addressed.

---

## 49. FINAL REPORT

After each significant implementation report:

Implemented:
Files changed:
Functional logic:
Permissions:
Validation:
States:
Security:
Audit:
Accessibility:
Responsive behavior:
Performance:
Tests:
Visual QA:
Known limitations:
Next step:

Keep the report factual and concise.

---

## 50. FINAL PRINCIPLE

Design every admin workflow around:

SEE WHAT NEEDS ATTENTION
→ FIND THE RIGHT RECORD
→ UNDERSTAND CONTEXT
→ PERFORM THE ACTION
→ RECEIVE IMMEDIATE FEEDBACK
→ PRESERVE HISTORY
→ RECOVER SAFELY IF SOMETHING FAILS

The final product must feel like a real production gym-management SaaS, not a dashboard mockup or AI-generated template.
