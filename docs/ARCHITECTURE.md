# Nexus – Component Structure & Architecture (Milestone 1)

## Stack
- **React 18 + TypeScript**, built with **Vite**
- **Tailwind CSS** for styling (design tokens in `tailwind.config.js`)
- **react-router-dom v6** for routing, nested under a shared `DashboardLayout`
- **Context API** (`AuthContext`) for auth state; no real backend — mock data + `localStorage` persistence
- **react-hot-toast** for notifications, **lucide-react** for icons, **date-fns** for date formatting

## Folder structure
```
src/
├─ components/
│  ├─ ui/            Reusable primitives: Button, Card, Input, Badge, Avatar, Modal
│  ├─ layout/         Navbar, Sidebar, DashboardLayout (route shell)
│  ├─ investor/        InvestorCard
│  ├─ entrepreneur/     EntrepreneurCard
│  ├─ collaboration/    CollaborationRequestCard
│  ├─ chat/             ChatMessage, ChatUserList
│  ├─ meetings/         AvailabilityManager, RequestMeetingPanel, MeetingRequestCard   ← Week 1
│  ├─ documents/        DocumentUploader, DocumentCard, SignaturePad                    ← Week 2
│  ├─ payments/         WalletCard, FundDealPanel, TransactionHistoryTable              ← Week 3
│  ├─ auth/             PasswordStrengthMeter, OtpInput, ProtectedRoute (RequireAuth/RequireRole) ← Week 3
│  └─ onboarding/       OnboardingTour (guided walkthrough)                             ← Week 3
├─ pages/               One folder per route/feature (auth, dashboard, profile,
│                        investors, entrepreneurs, messages, notifications,
│                        documents, settings, help, deals, chat, meetings, call, payments)
├─ context/             AuthContext.tsx (login/register/session, localStorage-backed)
├─ data/                Mock datasets + helper functions acting as a fake API layer
│                        (users.ts, collaborationRequests.ts, messages.ts, meetings.ts,
│                        documents.ts, payments.ts)
├─ types/               Shared TypeScript interfaces (User, Investor, Entrepreneur,
│                        Message, CollaborationRequest, Document, AvailabilitySlot,
│                        Meeting, Transaction)
└─ App.tsx              Route table, wrapped in RequireAuth / RequireRole guards
```

## Key architectural patterns already in the codebase (followed for new features)
1. **Data layer mimics an API.** Each file in `src/data/` exports mock arrays plus
   plain functions (`getRequestsForEntrepreneur`, `updateRequestStatus`, etc.) that
   read/mutate the array. New features should add a sibling file rather than fetching
   from a real backend.
2. **Role-based routing.** `DashboardLayout` wraps every authenticated route and
   renders `Sidebar` + `Navbar`. The sidebar itself branches on `user.role`
   (`entrepreneur` vs `investor`) to show different nav items.
3. **UI kit first.** All screens compose `Card`/`CardHeader`/`CardBody`/`CardFooter`,
   `Button`, `Badge`, `Input`, `Avatar` instead of raw HTML, so visuals stay consistent.
4. **Local persistence.** `AuthContext` reads/writes `localStorage` directly (no Redux/Zustand).
   The new Meetings feature (`src/data/meetings.ts`) follows the same convention so
   availability slots and meeting requests survive a page refresh.
5. **Toasts for feedback.** Every mutating action (accept/decline, add/remove, submit)
   fires a `react-hot-toast` message — kept consistent in the new Meetings UI.

## What Week 1 added
- `src/types/index.ts` → `AvailabilitySlot`, `Meeting` types
- `src/data/meetings.ts` → mock data + CRUD-style helpers for slots & meetings
- `src/components/meetings/*` → `AvailabilityManager`, `RequestMeetingPanel`, `MeetingRequestCard`
- `src/pages/meetings/MeetingsPage.tsx` → calendar (react-calendar) + request/response workflow
- Route `/meetings` added in `App.tsx`; nav link added in `Sidebar.tsx` for both roles
- Dashboard "Upcoming Meetings" stat cards now read real data and link to `/meetings`

## What Week 2 added
**Video Calling (frontend mock, Milestone 3)**
- `src/pages/call/VideoCallPage.tsx` — real `getUserMedia`/`getDisplayMedia` calls for local
  camera preview, mic/camera toggles, and screen sharing. The "remote" participant tile is a
  placeholder, since there is no signaling/backend server to establish a real peer connection.
- "Join Call" button appears on confirmed meetings (`MeetingRequestCard`) → `/call/:meetingId`

**Document Processing Chamber (Milestone 4)**
- `src/types/index.ts` → extended `Document` with `status` (`draft`/`in_review`/`signed`) and
  signature fields
- `src/data/documents.ts` → mock document store with localStorage persistence
- `src/components/documents/*` → `DocumentUploader` (react-dropzone drag & drop),
  `DocumentCard` (preview modal, status control, share/delete), `SignaturePad`
  (canvas-based e-signature capture)
- `src/pages/documents/DocumentsPage.tsx` rebuilt as the "Document Chamber" with status filters

## What Week 3 added
**Payments (Milestone 5)**
- `src/types/index.ts` → `Transaction` type
- `src/data/payments.ts` → per-user mock wallet balances + transaction ledger, with
  `deposit`/`withdraw`/`transfer`/`fundDeal` helpers (localStorage-backed)
- `src/components/payments/*` → `WalletCard` (Stripe/PayPal-style balance + actions),
  `FundDealPanel` (investor → entrepreneur funding flow), `TransactionHistoryTable`
- `src/pages/payments/PaymentsPage.tsx`, route `/payments`, sidebar link for both roles
- Both dashboards show a live wallet-balance stat card linking to `/payments`

**Security & Access Control (Milestone 6)**
- `src/components/auth/PasswordStrengthMeter.tsx` — used on Register and Reset Password
- `src/components/auth/OtpInput.tsx` + a second step in `LoginPage.tsx` — mock 2FA: after
  credentials are verified, the user must enter a 6-digit code (shown in a demo toast, since
  there's no real SMS/email backend) before landing on their dashboard
- `src/components/auth/ProtectedRoute.tsx` (`RequireAuth`, `RequireRole`) — all dashboard
  routes now require an authenticated session, and `/dashboard/entrepreneur` vs
  `/dashboard/investor` are locked to the matching role instead of being open to either

**Integration & Demo Prep (Milestone 7)**
- Every new module (Meetings, Document Chamber, Payments) is reachable from the sidebar and/or
  a dashboard stat card for both roles
- `src/components/onboarding/OnboardingTour.tsx` — a lightweight guided walkthrough (5 steps)
  triggered from "Take a Tour" in the navbar, walking a new user through Dashboard → Meetings →
  Documents → Payments → Messages
- See `docs/DEMO_SCRIPT.md` for a suggested run-through when recording the final demo video

## Local setup
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```

## Known pre-existing lint warnings
`npm run lint` reports a handful of unused-variable warnings in files that predate this
internship's changes (e.g. `DashboardLayout.tsx`, `AuthContext.tsx`, `ChatPage.tsx`,
`MessagesPage.tsx`). These were present in the base repo before Week 1 and were left as-is
since fixing unrelated files wasn't in scope — flagging them here in case your reviewer runs
`npm run lint` and asks about it.
