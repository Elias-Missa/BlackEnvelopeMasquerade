# The Black Envelope Masquerade — The Consensus

An elegant multiplayer web game implementing the classic "Guess 2/3 of the Average" strategy game. Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

## How It Works

1. A **host** creates a game room and shares the 6-character room code
2. **Players** join using the room code, enter their name, and choose a number between 1–100
3. Once all players have submitted (minimum 3), the host reveals the results
4. The system calculates the **average**, then **2/3 of the average**
5. The player whose number is closest to 2/3 of the average **wins**

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Supabase** (database + realtime)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd black-envelope-masquerade
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Copy your project URL, anon key, and service role key from **Settings > API**

### 3. Configure Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Enable Realtime

In your Supabase dashboard:
1. Go to **Database > Replication**
2. Enable replication for the `rooms` and `players` tables
3. Or run the migration SQL which includes the realtime publication commands

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment to Vercel

1. Push your code to a Git repository
2. Import the project in [Vercel](https://vercel.com)
3. Add the three environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page (/)
│   ├── host/page.tsx        # Host page (/host)
│   ├── join/page.tsx        # Join page (/join)
│   └── room/[code]/page.tsx # Game room (/room/[code])
├── components/
│   ├── GoldDust.tsx         # Animated gold dust background
│   ├── GoldConfetti.tsx     # Gold confetti burst for winner
│   ├── CountUp.tsx          # Animated count-up numbers
│   └── RevealSequence.tsx   # Full cinematic reveal animation
└── lib/
    ├── actions.ts           # Server actions (create/join/submit/reveal)
    ├── types.ts             # TypeScript interfaces
    └── supabase/
        ├── client.ts        # Browser Supabase client
        └── server.ts        # Server Supabase client (service role)
```

## Database Schema

### rooms
| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID      | Primary key                    |
| code       | TEXT      | Unique 6-char room code        |
| status     | TEXT      | 'waiting' or 'revealed'        |
| host_token | TEXT      | Secret token for host auth     |
| created_at | TIMESTAMP | Creation time                  |

### players
| Column     | Type    | Description                     |
|------------|---------|---------------------------------|
| id         | UUID    | Primary key                     |
| room_id    | UUID    | Foreign key to rooms            |
| name       | TEXT    | Player display name             |
| number     | INTEGER | Chosen number (1-100)           |
| created_at | TIMESTAMP | Join time                     |

## License

MIT
