# Real-time Patient Intake System

A modern, real-time patient information form with staff monitoring capabilities. Built with Next.js, TypeScript, TailwindCSS, and Ably for WebSocket communication.

## Overview

This application provides a seamless patient intake experience where:
- Patients fill out their information in a user-friendly form
- Staff members can monitor forms being filled in real-time
- All data syncs instantly across all connected clients
- Automatic detection of inactive sessions

## Features

- **Patient Form**: Comprehensive intake form with validation
- **Staff Dashboard**: Real-time monitoring of all patient sessions
- **Live Sync**: Instant data synchronization using WebSockets (Ably)
- **Status Tracking**: Active, submitted, and inactive session states
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Form Validation**: Client-side validation with helpful error messages
- **Connection Monitoring**: Visual indicators for connection status

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Real-time Communication**: Ably (WebSocket)
- **State Management**: React hooks and local state

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Ably account (free tier available at [ably.com](https://ably.com))

### Installation

1. Clone the repository:
```bash
cd agnos-frontend-assignment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Get your Ably API key:
   - Sign up at [ably.com](https://ably.com)
   - Create a new app
   - Copy your API key

5. Add your Ably key to `.env.local`:
```env
ABLY_API_KEY=your_ably_api_key_here
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing the Application

1. Open the home page at `http://localhost:3000`
2. Open the **Staff Dashboard** in one browser window/tab
3. Open the **Patient Form** in another browser window/tab
4. Start filling the patient form and watch the staff dashboard update in real-time

## Project Structure

```
agnos-frontend-assignment/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/
│   │   │   └── ably-token/    # Ably token authentication endpoint
│   │   ├── patient/           # Patient form page
│   │   ├── staff/             # Staff dashboard page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── lib/                   # Utility functions
│   │   └── ably.ts           # Ably client with token auth
│   └── types/                 # TypeScript type definitions
│       └── patient.ts         # Patient data types
├── public/                    # Static assets
├── .env.local.example        # Environment variables template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # TailwindCSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Component Architecture

### Patient Form (`/patient/page.tsx`)
- Comprehensive intake form with validation
- Validates form fields using Zod schema
- Broadcasts form changes to Ably channel in real-time
- Handles form submission with timestamp
- Connection status indicator

**Key Features**:
- Real-time field-level updates via `watch()`
- React Hook Form with Zod validation
- Publishes `form-update` events on change
- Publishes `form-submitted` event on submission
- Clean, responsive healthcare UI

### Staff Dashboard (`/staff/page.tsx`)
- Subscribes to patient form updates
- Displays form data in real-time
- Tracks activity status with smart detection
- Shows connection and form status

**Key Features**:
- Subscribes to `form-update` and `form-submitted` events
- Status indicators: Not started, Actively filling, Inactive, Submitted
- Automatic status updates every second based on last activity
- Inactive: 5-30 seconds since last update
- Actively filling: < 5 seconds since last update

## Real-Time Synchronization Flow

```
┌─────────────────┐                    ┌─────────────────┐
│  Patient Form   │                    │ Staff Dashboard │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ 1. Request token from /api/ably-token
         ├──────────────────────────────────┐  │
         │        2. Connect via authUrl     │  │
         │                                   │  │
         │         Ably Cloud               ├──┤
         │      (WebSocket Server)          │  │
         │                                   │  │
         │ 3. User types in form field      │  │
         ├──────────────────────────────────┤  │
         │                                   │  │
         │ 4. Publish "form-update" event   │  │
         ├──────────────────────────────────┤  │
         │                                   ├──┤
         │              5. Receive update    │  │
         │              6. Update UI         │  │
         │                                   │  │
         │ 7. Submit form                   │  │
         ├──────────────────────────────────┤  │
         │ 8. Publish "form-submitted"      │  │
         ├──────────────────────────────────┤  │
         │                                   ├──┤
         │              9. Show submitted    │  │
         │                                   │  │
```

### Event Types

1. **form-update**: Sent when any form field changes
   - Contains: All form data (PatientFormData)
   - Triggered by: React Hook Form `watch()`

2. **form-submitted**: Sent when form is submitted
   - Contains: Complete form data + `submittedAt` timestamp
   - Triggered by: Form submission

### Security: Token Authentication

This implementation uses **secure token authentication** instead of exposing API keys on the client:

1. Client requests token from `/api/ably-token`
2. Server generates token using `ABLY_API_KEY` (server-side only)
3. Client connects to Ably using the token
4. Token expires automatically (managed by Ably)

### Status States

- **not-started**: No data received yet (⚪)
- **actively-filling**: Last update < 5 seconds ago (🟢)
- **inactive**: Last update 5-30 seconds ago (🟡)
- **submitted**: Form submitted successfully (✅)

## Form Fields

### Required Fields
- First Name
- Last Name
- Date of Birth
- Gender
- Phone Number
- Email
- Address
- Preferred Language
- Nationality

### Optional Fields
- Middle Name
- Emergency Contact Name
- Emergency Contact Relationship
- Religion

## Validation Rules

- **Names**: 1-50 characters
- **Email**: Valid email format
- **Phone**: Digits, spaces, dashes, parentheses, and plus signs allowed
- **Address**: 1-200 characters
- **Date of Birth**: Cannot be in the future

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `ABLY_API_KEY` environment variable (keep it secret, server-side only)
4. Deploy

### Other Platforms

This application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to set the `ABLY_API_KEY` environment variable in your deployment platform.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ABLY_API_KEY` | Your Ably API key for token authentication (server-side only) | Yes |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Architecture Decisions

### Why Ably with Token Authentication?
- Managed WebSocket service (no custom server needed)
- Works seamlessly with serverless deployments (Vercel, Netlify)
- Automatic reconnection and presence detection
- **Secure token authentication** - API key never exposed to client
- Free tier suitable for demos and small projects
- Easy to set up and use

### Why React Hook Form + Zod?
- Type-safe form validation
- Excellent performance with minimal re-renders
- Easy to maintain and extend
- Great developer experience
- Built-in `watch()` for real-time updates

### Why Next.js App Router?
- Modern React features (Server Components)
- Built-in API routes for `/api/ably-token`
- Built-in routing and layouts
- Excellent performance optimization
- Easy deployment

## Known Limitations

- Sessions are stored in memory (not persisted to database)
- No authentication or authorization
- Limited to Ably's free tier connection limits
- No data encryption at rest (demonstration purposes only)

## Future Enhancements

- Add database persistence (PostgreSQL, MongoDB)
- Implement user authentication
- Add form export functionality (PDF, CSV)
- Include form submission history
- Add staff notifications for new submissions
- Implement form templates
- Add multi-language support

## License

This project is created as part of the Agnos front-end developer assignment.

## Support

For issues or questions, please refer to the assignment documentation or contact the development team.
