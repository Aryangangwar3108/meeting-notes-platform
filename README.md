# Meeting Notes Platform

A Fireflies.ai-inspired meeting notes and transcription workspace built with modern web technologies. This full-stack application provides a professional SaaS-quality interface for managing meetings, viewing interactive transcripts, and tracking action items.

## Features

### Required Features

- **Meetings Library**: Browse, search, filter, and sort meetings with a modern dashboard interface
- **Meeting Detail View**: Comprehensive meeting pages with transcripts, summaries, and action items
- **Interactive Transcript**: Click-to-seek transcript segments with speaker identification and timestamps
- **Media Player**: Functional audio player with play/pause, seek, and transcript synchronization
- **Transcript Search**: Search within transcripts with match highlighting and navigation
- **AI Summary**: Meeting overviews, key decisions, topics, and timestamped chapters
- **Action Items**: Create, edit, delete, and complete action items with assignees and due dates
- **Meeting CRUD**: Full create, read, update, delete operations for meetings
- **Database Persistence**: SQLite database with proper relational schema
- **Responsive Design**: Works on desktop, laptop, tablet, and mobile devices
- **Loading/Error/Empty States**: Professional UI states throughout the application
- **Toast Notifications**: User feedback for all important actions

### Placeholder Features

- **Live Meeting Bot**: Coming soon - Automated meeting transcription
- **Integrations**: Coming soon - Calendar and CRM integrations
- **Team Collaboration**: Coming soon - Shared workspaces and permissions

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL ORM and toolkit
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server

### Database
- **SQLite** - Lightweight, file-based SQL database

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Next.js Frontend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │ Components   │  │  API Layer   │      │
│  │  (React)     │  │  (Reusable)  │  │  (Typed)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    FastAPI Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routers    │  │   CRUD       │  │   Schemas    │      │
│  │  (Endpoints) │  │  (Business)  │  │ (Validation) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ SQLAlchemy ORM
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    SQLite Database                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Meetings   │  │ Participants │  │  Transcripts │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Action Items │  │    Topics    │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

#### `meetings`
Core meeting data
- `id` (Integer, Primary Key)
- `title` (String, Required)
- `summary` (Text, Optional)
- `date` (DateTime, Required)
- `duration` (Integer, Required) - Duration in minutes
- `created_at` (DateTime, Auto-generated)
- `updated_at` (DateTime, Auto-updated)

#### `participants`
Unique participants across meetings
- `id` (Integer, Primary Key)
- `name` (String, Required)
- `email` (String, Unique, Required)

#### `meeting_participants`
Many-to-many relationship between meetings and participants
- `id` (Integer, Primary Key)
- `meeting_id` (Integer, Foreign Key → meetings.id)
- `participant_id` (Integer, Foreign Key → participants.id)

#### `transcript_segments`
Individual transcript lines with timestamps
- `id` (Integer, Primary Key)
- `meeting_id` (Integer, Foreign Key → meetings.id)
- `speaker` (String, Required)
- `text` (Text, Required)
- `start_time` (Float, Required) - Start time in seconds
- `end_time` (Float, Required) - End time in seconds

#### `action_items`
Tasks and follow-ups from meetings
- `id` (Integer, Primary Key)
- `meeting_id` (Integer, Foreign Key → meetings.id)
- `title` (String, Required)
- `description` (Text, Optional)
- `assignee` (String, Optional)
- `due_date` (DateTime, Optional)
- `completed` (Boolean, Default: False)
- `created_at` (DateTime, Auto-generated)
- `updated_at` (DateTime, Auto-updated)

#### `topics`
Key topics/chapters with timestamps
- `id` (Integer, Primary Key)
- `meeting_id` (Integer, Foreign Key → meetings.id)
- `title` (String, Required)
- `timestamp` (Float, Required) - Timestamp in seconds

### Relationships
- One-to-Many: Meetings → Transcript Segments
- One-to-Many: Meetings → Action Items
- One-to-Many: Meetings → Topics
- Many-to-Many: Meetings ↔ Participants (through meeting_participants)

## API Documentation

### Meetings

#### GET `/api/meetings`
List all meetings with optional filtering and sorting

**Query Parameters:**
- `search` (string, optional): Search by title or summary
- `participant` (string, optional): Filter by participant name
- `sort` (string, optional): "newest" (default) or "oldest"

**Response:** Array of Meeting objects

#### GET `/api/meetings/{id}`
Get detailed information about a specific meeting

**Response:** MeetingDetail object (includes transcript, action items, topics)

#### POST `/api/meetings`
Create a new meeting

**Request Body:**
```json
{
  "title": "string",
  "summary": "string (optional)",
  "date": "ISO 8601 datetime",
  "duration": number,
  "participant_emails": ["string"],
  "transcript": "string (optional)"
}
```

**Response:** Meeting object

#### PUT `/api/meetings/{id}`
Update an existing meeting

**Request Body:** Partial Meeting object (all fields optional)

**Response:** Updated Meeting object

#### DELETE `/api/meetings/{id}`
Delete a meeting

**Response:** Success message

### Transcripts

#### GET `/api/meetings/{id}/transcript`
Get transcript segments for a meeting

**Response:** Array of TranscriptSegment objects

#### POST `/api/meetings/{id}/transcript`
Create/update transcript for a meeting

**Request Body:** Transcript text in simple format

**Response:** Array of TranscriptSegment objects

### Action Items

#### GET `/api/meetings/{id}/action-items`
Get action items for a meeting

**Response:** Array of ActionItem objects

#### POST `/api/meetings/{id}/action-items`
Create a new action item

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "assignee": "string (optional)",
  "due_date": "ISO 8601 datetime (optional)",
  "completed": boolean (optional)
}
```

**Response:** ActionItem object

#### PUT `/api/action-items/{id}`
Update an action item

**Request Body:** Partial ActionItem object

**Response:** Updated ActionItem object

#### DELETE `/api/action-items/{id}`
Delete an action item

**Response:** Success message

### Topics

#### GET `/api/meetings/{id}/topics`
Get topics/chapters for a meeting

**Response:** Array of Topic objects

## Local Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Seed the database with sample data:
```bash
python seed.py
```

6. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

4. Start the Next.js development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Running Both Services

For development, run both the backend and frontend servers in separate terminal windows:
- Terminal 1: Backend (port 8000)
- Terminal 2: Frontend (port 3000)

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Backend
No environment variables required for local development. The database file (`meetings.db`) is created automatically in the backend directory.

## Deployment Status

No public deployment URL is configured for this submission. The verified local runtime is:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`

When deployed, replace this section with the public frontend URL and set `NEXT_PUBLIC_API_URL` to the public backend URL.

## Assumptions

1. **Authentication**: Authentication is mocked. The application assumes a default logged-in user ("John Doe").

2. **Speech-to-Text**: Real speech-to-text is not implemented. Transcript data is seeded/mock data that can be manually entered via the create meeting form.

3. **Audio**: The application serves and plays the local `frontend/public/sample-audio.wav` fixture. Production deployments should replace it with meeting-specific audio storage and serving.

4. **AI Summaries**: Summaries, key decisions, and topics are seeded/mock data. Real AI generation would require integration with LLM services.

5. **Integrations**: Calendar, video conferencing, and CRM integrations are placeholder screens pending future development.

6. **Database**: SQLite is used for simplicity. For production deployment, consider PostgreSQL or MySQL for better concurrency and performance.

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)

2. Import the project in [Vercel](https://vercel.com)

3. Configure the root directory as `frontend`

4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL

5. Deploy

### Backend Deployment (Render/Railway)

#### Option 1: Render
1. Push your code to a Git repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your repository
4. Set the root directory as `backend`
5. Configure the build command:
   ```
   pip install -r requirements.txt
   ```
6. Configure the start command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
7. Deploy

#### Option 2: Railway
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add PostgreSQL service (recommended over SQLite for production)
5. Configure environment variables
6. Deploy: `railway up`

### Database Considerations

**SQLite Limitations:**
- Single-writer concurrency
- Not suitable for high-traffic production
- Ephemeral storage on some platforms

**Production Recommendation:**
Switch to PostgreSQL for production deployment:
1. Update `backend/app/database.py` to use PostgreSQL connection string
2. Use environment variables for database credentials
3. Update the database URL in production

### CORS Configuration

The backend is configured to allow requests from `http://localhost:3000` for development. Update the CORS origins in `backend/app/main.py` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Project Structure

```
meeting-notes-platform/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard/home page
│   │   ├── globals.css         # Global styles
│   │   ├── meetings/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Meeting detail page
│   │   ├── settings/
│   │   │   └── page.tsx        # Settings page
│   │   ├── my-meetings/
│   │   │   └── page.tsx        # My meetings page
│   │   └── all-meetings/
│   │       └── page.tsx        # All meetings page
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx     # Navigation sidebar
│   │   ├── meetings/
│   │   │   ├── meeting-card.tsx
│   │   │   ├── meeting-list.tsx
│   │   │   └── create-meeting-form.tsx
│   │   ├── transcript/
│   │   │   ├── transcript-player.tsx
│   │   │   └── transcript-viewer.tsx
│   │   ├── summary/
│   │   │   └── meeting-summary.tsx
│   │   ├── action-items/
│   │   │   └── action-items-list.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       └── toast.tsx
│   ├── lib/
│   │   ├── api.ts              # Centralized API layer
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── utils.ts            # Utility functions
│   ├── public/
│   │   └── sample-audio.wav    # Local audio fixture for transcript synchronization
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI application entry
│   │   ├── database.py         # Database configuration
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── crud.py             # Database operations
│   │   └── routers/
│   │       ├── meetings.py     # Meeting endpoints
│   │       ├── transcripts.py  # Transcript endpoints
│   │       ├── action_items.py # Action item endpoints
│   │       └── topics.py       # Topic endpoints
│   ├── seed.py                 # Database seeding script
│   ├── requirements.txt        # Python dependencies
│   └── meetings.db            # SQLite database (created automatically)
├── README.md
└── .gitignore
```

## Known Limitations

1. **Audio Player**: The player is functional with the bundled sample WAV fixture; production deployments need meeting-specific audio files and storage.

2. **Transcript Parsing**: The transcript parser uses a simple format. Complex transcript formats (VTT, JSON) would require enhanced parsing logic.

3. **Search Performance**: Transcript search is client-side. For large transcripts, server-side search with indexing would be more efficient.

4. **Real-time Updates**: The application doesn't support real-time updates. WebSocket integration would be needed for live collaboration.

5. **File Uploads**: Transcript upload functionality is limited to text input. File upload handling would require additional backend logic.

6. **Authentication**: No real authentication system. This would require OAuth/JWT implementation for production.

7. **Database**: SQLite is used for simplicity. Production deployment should use PostgreSQL or similar.

## Suggested Interview Questions

### Architecture & Design

1. **Why did you choose Next.js with App Router over React Router?**
   - Next.js provides server-side rendering, file-based routing, and built-in optimization. The App Router offers improved performance and simpler data fetching patterns.

2. **How does the separation between frontend and backend API layer improve maintainability?**
   - Centralized API layer (`lib/api.ts`) provides type safety, reduces code duplication, makes API changes easier to manage, and enables better error handling.

3. **Why use SQLAlchemy instead of raw SQL queries?**
   - SQLAlchemy provides ORM capabilities, type safety, automatic schema management, and protection against SQL injection. It also makes the code more database-agnostic.

### Database Design

4. **Why use a many-to-many relationship for meeting participants?**
   - Participants can attend multiple meetings, and meetings can have multiple participants. A normalized schema avoids data duplication and enables efficient queries.

5. **How would you optimize the database for large-scale deployments?**
   - Add indexes on frequently queried fields (meeting dates, participant names), implement pagination, consider read replicas, and migrate to PostgreSQL for better concurrency.

### Frontend Implementation

6. **How does the transcript-player synchronization work?**
   - When a user clicks a transcript segment, the active segment ID is updated. The player (in a real implementation) would seek to that timestamp. When the player plays, it would update the active segment based on current time.

7. **Why use TypeScript throughout the application?**
   - TypeScript provides compile-time type checking, better IDE support, reduced runtime errors, and improved code documentation through type definitions.

### Backend Implementation

8. **How does Pydantic validation improve API robustness?**
   - Pydantic automatically validates incoming data against defined schemas, provides clear error messages, and ensures data consistency before it reaches the business logic.

9. **Why separate CRUD operations from route handlers?**
   - Separation of concerns makes the code more testable, reusable, and maintainable. CRUD functions can be used by multiple endpoints or CLI scripts without duplication.

### Scalability & Performance

10. **How would you handle real-time transcript updates during a live meeting?**
    - Implement WebSocket connections for real-time data streaming, use a message queue (Redis) for handling high-frequency updates, and optimize database writes with batching.

11. **What strategies would you use to optimize the application for mobile devices?**
    - Implement responsive design, lazy loading for transcripts, optimize bundle size with code splitting, use Web Workers for transcript search, and implement service workers for offline functionality.

## License

This project is created as a demonstration project for educational purposes.
