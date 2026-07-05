# Nexus — Investor & Entrepreneur Collaboration Platform

A React + TypeScript platform connecting startup founders with investors: profiles,
collaboration requests, messaging, meeting scheduling, video calls, a document e-signature
chamber, and simulated payments.

> This is a frontend-only demo. There is no backend — auth, data, and payments are mocked and
> persisted in the browser's `localStorage`.

## What's New in This Submission

This build covers all three weeks of the internship task sheet, on top of the original
base repo. Full file-by-file breakdown is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

| Week | Milestone | What was added |
|---|---|---|
| 1 | Setup & Theme | Documented component structure & theme system ([`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/THEME.md`](docs/THEME.md)) |
| 1 | Meeting Calendar | Availability slots, send/accept/decline meeting requests, calendar view (`/meetings`) |
| 2 | Video Calling | Real camera/mic/screen-share preview via WebRTC device APIs (`/call/:meetingId`) |
| 2 | Document Chamber | Upload, preview, canvas e-signature, Draft/In Review/Signed status (`/documents`) |
| 3 | Payments | Wallet balance, deposit/withdraw/transfer, investor → entrepreneur funding, transaction history (`/payments`) |
| 3 | Security | Password strength meter, 2FA/OTP mock login step, role-locked dashboard routes |
| 3 | Integration | All modules wired into navigation, guided "Take a Tour" walkthrough |

See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for the suggested demo video walkthrough.

## Tech stack
- React 18 + TypeScript, built with Vite
- Tailwind CSS
- react-router-dom v6
- react-calendar, react-dropzone, react-hot-toast, lucide-react, date-fns

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```
Then open the URL it prints (usually **http://localhost:5173**).

Other useful commands:
```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

## Logging in
There's no real backend, so log in with any of the seeded mock accounts (see
`src/data/users.ts` for the full list), or use the "Entrepreneur Demo" / "Investor Demo"
quick-login buttons on the login page. On login you'll be asked for a 6-digit 2FA code;
since there's no email/SMS service, the code is shown to you directly in a toast notification.

## Features
- **Meetings** (`/meetings`) — set availability, request/accept/decline meetings, calendar view
- **Video Call** (`/call/:meetingId`) — join from a confirmed meeting; real camera/mic/screen-share preview (frontend-only, no signaling server, so the other participant is a placeholder)
- **Document Chamber** (`/documents`) — upload, preview, e-sign, and track document status
- **Payments** (`/payments`) — simulated wallet, deposit/withdraw/transfer, investor → entrepreneur deal funding
- **Take a Tour** — guided walkthrough of the app, available from the navbar after logging in

## Project structure
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full breakdown of the folder
structure and where each feature lives.

Other docs:
- [`docs/THEME.md`](docs/THEME.md) — color/typography/spacing conventions
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — suggested walkthrough for a demo recording

## Live Demo
- **Live site:** https://nexus-five-vert.vercel.app
- **Repository:** https://github.com/Shanza23/Nexus

## Deployment
This repo includes a `vercel.json` (SPA rewrite rule) and deploys cleanly to
[Vercel](https://vercel.com): import the repo, framework preset **Vite**, no environment
variables required.
