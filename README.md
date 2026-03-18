# Agnos Frontend Assignment

Real-time patient intake system built with Next.js 15, Ably Pub/Sub, and TailwindCSS.

## Architecture

```mermaid
graph TD
    A[Patient Browser] -->|fills form| B[Patient Form /patient]
    B -->|publish form-update| C[Ably Channel: patient-form]
    C -->|subscribe form-update| D[Staff Dashboard /staff]
    D -->|displays live data| E[Staff Browser]

    B -->|GET authUrl| F[/api/ably-token]
    F -->|createTokenRequest| G[Ably REST API]
    G -->>F
    F -->>B

    D -->|GET authUrl| F
```

## Real-time Flow

```mermaid
sequenceDiagram
    participant P as Patient Form
    participant A as /api/ably-token
    participant C as Ably Channel
    participant S as Staff Dashboard

    P->>A: GET /api/ably-token
    A-->>P: TokenRequest
    P->>C: connect (token auth)

    S->>A: GET /api/ably-token
    A-->>S: TokenRequest
    S->>C: connect + subscribe("form-update")

    loop On every input change
        P->>C: publish("form-update", { formData })
        C-->>S: message received
        S->>S: update UI in real-time
    end

    P->>C: publish("form-submitted", { formData })
    C-->>S: message received
    S->>S: status → submitted
```

## Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> not_started
    not_started --> actively_filling: form-update received
    actively_filling --> inactive: no update for 5s
    inactive --> actively_filling: form-update received
    actively_filling --> submitted: form-submitted received
    inactive --> submitted: form-submitted received
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | TailwindCSS |
| Real-time | Ably Pub/Sub |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Add your Ably API key to `.env.local`:

```env
ABLY_API_KEY=your_ably_api_key_here
```

Get a free key at [ably.com](https://ably.com/signup).

### 3. Run development server

```bash
npm run dev
```

### 4. Open in browser

| URL | Description |
|---|---|
| http://localhost:3000 | Home |
| http://localhost:3000/patient | Patient registration form |
| http://localhost:3000/staff | Staff dashboard |

> Open `/patient` and `/staff` in **separate tabs** for real-time sync to work.

## Project Structure

```
src/
├── app/
│   ├── api/ably-token/route.ts   # Token auth endpoint (server-side)
│   ├── patient/page.tsx          # Patient form
│   ├── staff/page.tsx            # Staff dashboard
│   └── page.tsx                  # Home page
├── components/ui/                # Shared UI components
├── lib/
│   └── ably.ts                   # Ably singleton client
└── types/
    └── patient.ts                # Zod schemas and types
```

## Feature Branches

| Branch | Description |
|---|---|
| `feat/patient-form` | Multi-step patient registration form |
| `feat/staff-view` | Staff dashboard with real-time subscription |
| `feat/realtime-sync` | Ably token auth and sync bug fixes |
| `feat/redesign` | Healthcare UI redesign |
