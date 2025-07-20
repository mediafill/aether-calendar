# Aether Calendar

An intelligent calendar application with AI-powered assistant built with React, React Native, Node.js, and Google APIs.

## Features

- 🗓️ **Google Calendar Integration** - Sync with your existing Google Calendar
- 🤖 **AI Assistant** - Natural language event creation and management using Google Gemini
- 📱 **Cross-Platform** - Web and mobile applications sharing the same codebase
- 🏷️ **Smart Organization** - Event importance levels, tags, and reminders
- 📊 **Multiple Views** - Agenda, Week, and Month calendar views
- 💬 **Conversational Interface** - Chat with Aether to manage your calendar

## Architecture

This is a monorepo built with pnpm workspaces containing:

- **apps/web** - React web application (Vite + TypeScript)
- **apps/mobile** - React Native mobile app (Expo)
- **apps/server** - Node.js API server (Express + TypeScript)
- **packages/shared-types** - Shared TypeScript interfaces
- **packages/ui** - Shared React/React Native components
- **packages/config** - Shared ESLint/Prettier/TypeScript configs

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database
- Google Cloud Console project with:
  - Calendar API enabled
  - OAuth 2.0 credentials
  - Gemini API key

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd aether-calendar
   pnpm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` files and configure:
   
   **Server (apps/server/.env):**
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/aether_calendar"
   JWT_SECRET="your-super-secret-jwt-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"
   GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
   PORT=3001
   ```
   
   **Web (apps/web/.env):**
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_API_BASE_URL=http://localhost:3001/api/v1
   ```

3. **Set up the database:**
   ```bash
   cd apps/server
   pnpm db:push
   pnpm db:generate
   ```

4. **Start development servers:**
   ```bash
   # Root directory - starts all apps in parallel
   pnpm dev
   
   # Or individually:
   cd apps/server && pnpm dev    # API server on :3001
   cd apps/web && pnpm dev       # Web app on :3000
   cd apps/mobile && pnpm dev    # Mobile app (Expo)
   ```

## Google API Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Enable the Generative AI API (for Gemini)

### 2. OAuth 2.0 Credentials
1. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
2. Add authorized origins:
   - `http://localhost:3000` (web dev)
   - Your production domain
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - Your production callback URL

### 3. Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini Pro

## API Endpoints

### Authentication
- `POST /api/v1/auth/google` - Google OAuth login

### Events
- `GET /api/v1/events?startDate=...&endDate=...` - Get events
- `POST /api/v1/events` - Create event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

### AI Chat
- `POST /api/v1/chat` - Send message to Aether assistant

## Development

### Scripts
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages

### Database Management
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes
- `pnpm db:migrate` - Run migrations

## Deployment

### Server (Backend)
Recommended: Google Cloud Run, Railway, or similar Node.js hosting

### Web App
Recommended: Vercel, Netlify, or similar static hosting

### Mobile App
Use Expo Application Services (EAS) for building and distribution

## Tech Stack

- **Frontend**: React, React Native, TypeScript, TanStack Query, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **APIs**: Google Calendar API, Google Gemini AI
- **Tools**: Vite, Expo, ESLint, Prettier, pnpm workspaces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.