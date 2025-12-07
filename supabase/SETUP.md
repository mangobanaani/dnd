# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `dnd-campaign-manager`
   - Database Password: (generate a strong password)
   - Region: Choose closest to you
4. Wait for project to finish setting up (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to Settings > API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin tasks)

## 3. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 4. Run Database Migrations

### Option A: Using Supabase SQL Editor (Easiest)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20250101000000_initial_schema.sql`
5. Paste into the SQL editor
6. Click "Run" at the bottom right

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## 5. Set Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
7. Copy Client ID and Client Secret
8. In Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Google
   - Paste Client ID and Client Secret
   - Save

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (Consumer type)
3. Add "Facebook Login" product
4. In Settings > Basic:
   - Copy App ID and App Secret
5. In Facebook Login > Settings:
   - Add Valid OAuth Redirect URIs:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
6. In Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Facebook
   - Paste App ID and App Secret
   - Save

## 6. Configure Email Templates (Optional)

1. In Supabase dashboard, go to Authentication > Email Templates
2. Customize the templates for:
   - Confirm signup
   - Invite user
   - Magic link
   - Change email address
   - Reset password

## 7. Test Authentication

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000
3. Try signing up with email/password
4. Try signing in with Google/Facebook (if configured)

## Database Schema Overview

### Tables Created:

- **profiles** - User profiles (extends auth.users)
  - Stores display name, avatar, default role (DM/Player/Both)
  - Automatically created when user signs up

- **campaigns** - D&D campaigns
  - Each campaign has one DM
  - Can have multiple players via campaign_members

- **campaign_members** - Links users to campaigns
  - Defines role per campaign (DM or Player)

- **characters** - Player characters
  - Linked to campaign and player
  - Stores all D&D 5e character stats

- **sessions** - Session notes
  - Tracks game sessions per campaign

### Row Level Security (RLS)

All tables have RLS enabled for security:
- Users can only see their own data
- DMs can see all data in their campaigns
- Players can see data in campaigns they've joined

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` values
- Make sure you're using the **anon** key, not service_role for client-side
- Restart your dev server after changing `.env.local`

### Users not being created in profiles table
- Check if the `on_auth_user_created` trigger is active
- Run the migration again if needed

### OAuth redirect not working
- Ensure redirect URIs are exactly correct (no trailing slashes)
- Check if OAuth app is in production mode (not testing)
- Verify callback URL in Supabase matches OAuth provider settings

### Can't access database tables
- Verify RLS policies are in place
- Check if user is authenticated (`console.log(user)`)
- Ensure user_id in queries matches auth.uid()
