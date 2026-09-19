# Dream Maker Developers (DMD)

Modern Enterprise Web Platform, Digital Media, and AI Solutions with Live CMS & Supabase Backend.

## Features

- **Live Dynamic CMS**: Real-time content management with 5-second smart synchronization.
- **Supabase Backend**: Fast PostgreSQL database and CDN-backed Supabase Storage for all assets.
- **Fully Responsive Admin Portal**: Designed for phones, tablets, and desktop displays with mobile sliding drawer navigation.
- **Full-Screen Mobile Menu**: Immersive, phone-optimized full-screen navigation overlay on mobile screens.
- **Authentication**: Secure scrypt-hashed admin authentication with JWT session tokens.
- **Production-Ready**: Vite + React + TypeScript + Tailwind CSS with Node.js production server.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials and admin login details:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YOUR_KEY
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_KEY

ADMIN_EMAIL=admin@dreammakerdevelopers.com
ADMIN_PASSWORD=YourSecurePassword
PORT=4000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only: never prefix it with `VITE_` or
expose it in browser code. Set the same key, plus `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`, in your Vercel project
environment variables. CMS saves require those server-side variables.

### 3. Build & Run Production Server
```bash
npm run build
npm run start
```

### 4. Development Mode
```bash
npm run dev
```

## Admin Portal
Access the admin portal at `/admin/login`. The initial admin credentials from `.env` are automatically provisioned on the first login attempt.
