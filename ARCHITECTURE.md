# Nashville Charts - Project Architecture

## Project Overview
A web-based application for creating, storing, sharing, and discovering Nashville Number System charts. Mobile-first design with focus on intuitive chart creation and community sharing.

## Technology Stack

### Backend
- **.NET 8** (LTS) - MVC Framework
- **ASP.NET Core Identity** - User management
- **Entity Framework Core 8** - ORM
- **Microsoft SQL Server** - Database (LocalDB for development)
- **OAuth 2.0** - Social login (Google, Microsoft, GitHub)

### Frontend
- **React 18** - UI components and chart editor
- **Bootstrap 5** - Base responsive layout
- **Custom CSS** - Chart rendering and mobile interactions
- **Vite** - Fast React bundling and HMR

### Additional Libraries
- **jsPDF** or **pdfmake** - PDF generation client-side
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **SignalR** (future) - Real-time collaboration

## Project Structure

```
nashville-charts/
├── src/
│   ├── NashvilleCharts.Web/           # Main MVC application
│   │   ├── Controllers/               # API and MVC controllers
│   │   ├── Models/                    # View models and DTOs
│   │   ├── Views/                     # Razor views (minimal - mainly layout)
│   │   ├── wwwroot/                   # Static files
│   │   └── Program.cs                 # Application startup
│   │
│   ├── NashvilleCharts.Core/          # Business logic layer
│   │   ├── Entities/                  # Domain models
│   │   ├── Interfaces/                # Repository and service interfaces
│   │   └── Services/                  # Business logic services
│   │
│   ├── NashvilleCharts.Infrastructure/ # Data access layer
│   │   ├── Data/                      # DbContext and configurations
│   │   ├── Repositories/              # Repository implementations
│   │   └── Migrations/                # EF Core migrations
│   │
│   └── NashvilleCharts.Client/        # React application
│       ├── src/
│       │   ├── components/            # React components
│       │   │   ├── Editor/            # Chart editor components
│       │   │   ├── Viewer/            # Chart display components
│       │   │   ├── Common/            # Shared components
│       │   │   └── Layout/            # Layout components
│       │   ├── services/              # API service layer
│       │   ├── hooks/                 # Custom React hooks
│       │   ├── utils/                 # Utility functions
│       │   ├── styles/                # CSS files
│       │   └── App.jsx                # Root component
│       ├── public/
│       └── vite.config.js
│
├── tests/
│   ├── NashvilleCharts.UnitTests/
│   └── NashvilleCharts.IntegrationTests/
│
├── docs/                              # Documentation
└── README.md
```

## Database Schema

### Users (ASP.NET Identity tables + extensions)
```sql
-- AspNetUsers (built-in Identity table)
-- Extended with custom columns:
ALTER TABLE AspNetUsers ADD
    DisplayName NVARCHAR(100),
    Bio NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2
```

### Charts
```sql
CREATE TABLE Charts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,  -- FK to AspNetUsers
    Title NVARCHAR(200) NOT NULL,
    Artist NVARCHAR(200),
    Key NVARCHAR(10) NOT NULL,      -- e.g., "C", "G", "Bb"
    TimeSignature NVARCHAR(10) DEFAULT '4/4',
    Tempo INT NULL,
    Content NVARCHAR(MAX) NOT NULL,  -- JSON or plain text chart data
    IsPublic BIT DEFAULT 0,
    AllowComments BIT DEFAULT 1,
    ViewCount INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    DeletedAt DATETIME2 NULL,        -- Soft delete

    CONSTRAINT FK_Charts_Users FOREIGN KEY (UserId)
        REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    INDEX IX_Charts_UserId (UserId),
    INDEX IX_Charts_IsPublic_ViewCount (IsPublic, ViewCount),
    INDEX IX_Charts_Title (Title),
    INDEX IX_Charts_Artist (Artist)
)
```

### ChartVotes
```sql
CREATE TABLE ChartVotes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ChartId UNIQUEIDENTIFIER NOT NULL,
    UserId NVARCHAR(450) NOT NULL,
    VoteType INT NOT NULL,           -- 1 = upvote, -1 = downvote
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT FK_ChartVotes_Charts FOREIGN KEY (ChartId)
        REFERENCES Charts(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ChartVotes_Users FOREIGN KEY (UserId)
        REFERENCES AspNetUsers(Id) ON DELETE NO ACTION,
    CONSTRAINT UQ_ChartVotes_User_Chart UNIQUE (ChartId, UserId),
    INDEX IX_ChartVotes_ChartId (ChartId),
    INDEX IX_ChartVotes_UserId (UserId)
)
```

### ChartComments
```sql
CREATE TABLE ChartComments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ChartId UNIQUEIDENTIFIER NOT NULL,
    UserId NVARCHAR(450) NOT NULL,
    ParentCommentId UNIQUEIDENTIFIER NULL, -- For nested replies
    Content NVARCHAR(2000) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    DeletedAt DATETIME2 NULL,        -- Soft delete

    CONSTRAINT FK_ChartComments_Charts FOREIGN KEY (ChartId)
        REFERENCES Charts(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ChartComments_Users FOREIGN KEY (UserId)
        REFERENCES AspNetUsers(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ChartComments_Parent FOREIGN KEY (ParentCommentId)
        REFERENCES ChartComments(Id),
    INDEX IX_ChartComments_ChartId (ChartId),
    INDEX IX_ChartComments_UserId (UserId),
    INDEX IX_ChartComments_ParentId (ParentCommentId)
)
```

### ChartTags (for future search/categorization)
```sql
CREATE TABLE Tags (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
)

CREATE TABLE ChartTags (
    ChartId UNIQUEIDENTIFIER NOT NULL,
    TagId INT NOT NULL,

    CONSTRAINT PK_ChartTags PRIMARY KEY (ChartId, TagId),
    CONSTRAINT FK_ChartTags_Charts FOREIGN KEY (ChartId)
        REFERENCES Charts(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ChartTags_Tags FOREIGN KEY (TagId)
        REFERENCES Tags(Id) ON DELETE CASCADE
)
```

## Chart Data Model

Charts will be stored as JSON in the `Content` field for flexibility:

```json
{
  "version": "1.0",
  "sections": [
    {
      "type": "intro",
      "label": "Intro",
      "measures": [
        {
          "chords": [
            {
              "numeral": "I",
              "modifiers": ["diamond"]
            }
          ]
        },
        {
          "chords": [
            {
              "numeral": "IV",
              "modifiers": []
            },
            {
              "numeral": "V",
              "modifiers": []
            }
          ]
        }
      ]
    },
    {
      "type": "verse",
      "label": "Verse",
      "measures": [
        {
          "chords": [
            {
              "numeral": "I",
              "modifiers": []
            }
          ]
        },
        {
          "chords": [
            {
              "numeral": "IV",
              "modifiers": []
            }
          ]
        },
        {
          "chords": [
            {
              "numeral": "I",
              "modifiers": ["push-back"]
            }
          ]
        },
        {
          "chords": [
            {
              "numeral": "V",
              "modifiers": []
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "measuresPerLine": 4,
    "notes": ""
  }
}
```

### Chord Modifiers
- `diamond` - Hold/whole note
- `push-back` - Syncopate earlier (<)
- `push-forward` - Syncopate later (>)
- `staccato` - Choke/stop (^)
- `minor` - Minor chord (m)
- `slash-{numeral}` - Slash chord (e.g., "slash-III" for I/III)

## Editor Design

### Desktop Mode (Power Mode)
- Split screen: Text input (left) | Live preview (right)
- Toolbar with symbol buttons above text area
- Keyboard shortcuts:
  - `Cmd/Ctrl + D` - Add diamond
  - `Cmd/Ctrl + <` - Push back
  - `Cmd/Ctrl + >` - Push forward
  - `Cmd/Ctrl + M` - Minor
  - Tab - New section
- Real-time validation and syntax highlighting

### Mobile Mode (Guided Mode)
- Chart preview fills screen
- Tap to edit/add content
- **Radial Wheel Picker:**
  1. Tap on chart → First wheel appears with Roman numerals (I-VII, ♭VII, #IV, etc.)
  2. Select numeral → Second wheel appears with modifiers (diamond, push, minor, slash, staccato)
  3. Select modifier (or tap center to skip) → Chord is placed
- Bottom toolbar for sections (Add Verse, Add Chorus, etc.)
- Swipe gestures:
  - Swipe left on measure → Delete
  - Long press → Context menu (duplicate, delete, edit)
- Toggle switch to "Power Mode" if user wants text input

### Rendering Engine
- Custom React component renders JSON to visual chart
- CSS Grid for measure layout
- SVG for special symbols (diamond, push arrows, etc.)
- Responsive: adapts to screen size
- Print-friendly CSS for PDF export

## Authentication Strategy

### OAuth Providers
- Google OAuth 2.0
- Microsoft Account
- GitHub (for developer community)

### Flow
1. User clicks "Login with Google" (or other provider)
2. Redirects to provider's OAuth consent page
3. After approval, redirects back with authorization code
4. Backend exchanges code for access token
5. Backend retrieves user profile info
6. Creates/updates user in database
7. Issues JWT or cookie-based session
8. Frontend stores auth state

### Implementation
- Use **Microsoft.AspNetCore.Authentication.Google**, **.Microsoft**, **.GitHub** packages
- Optional: Add email/password auth with ASP.NET Core Identity as fallback
- Store minimal PII: email, display name, profile picture URL

## API Endpoints (v1)

### Authentication
- `POST /api/auth/login` - Initiate OAuth flow
- `POST /api/auth/logout` - End session
- `GET /api/auth/user` - Get current user info

### Charts
- `GET /api/charts` - List charts (public or user's own)
  - Query params: `?userId=, ?search=, ?artist=, ?sort=`
- `GET /api/charts/{id}` - Get single chart
- `POST /api/charts` - Create new chart (authenticated)
- `PUT /api/charts/{id}` - Update chart (authenticated, owner only)
- `DELETE /api/charts/{id}` - Soft delete chart (authenticated, owner only)
- `GET /api/charts/{id}/pdf` - Export chart as PDF

### Votes
- `POST /api/charts/{id}/vote` - Upvote/downvote chart (authenticated)
  - Body: `{ "voteType": 1 or -1 }`
- `DELETE /api/charts/{id}/vote` - Remove vote (authenticated)

### Comments
- `GET /api/charts/{id}/comments` - Get comments for chart
- `POST /api/charts/{id}/comments` - Add comment (authenticated)
- `PUT /api/comments/{id}` - Edit comment (authenticated, owner only)
- `DELETE /api/comments/{id}` - Soft delete comment (authenticated, owner only)

### Search (v1 - basic)
- `GET /api/search?q={query}` - Search charts by title or artist
  - Returns: Charts with relevance ranking

## Development Workflow

### Local Development
1. Install .NET 8 SDK
2. Install Node.js (for React)
3. Install SQL Server Express or use LocalDB
4. Clone repository
5. Run migrations: `dotnet ef database update`
6. Start backend: `dotnet run` (in NashvilleCharts.Web)
7. Start frontend: `npm run dev` (in NashvilleCharts.Client)
8. Backend runs on `https://localhost:5001`
9. Frontend runs on `http://localhost:5173`
10. Frontend proxies API calls to backend

### Testing
- **Unit tests**: xUnit for business logic
- **Integration tests**: WebApplicationFactory for API endpoints
- **E2E tests** (future): Playwright or Cypress

### Deployment (Future)
- **Azure App Service** for web app
- **Azure SQL Database** for production database
- **Azure Blob Storage** (optional) for generated PDFs
- **Azure CDN** (optional) for static assets
- CI/CD with GitHub Actions

## Phase 1 Deliverables (v1)

### Must Have
1. User registration/login with OAuth (Google at minimum)
2. Chart editor (desktop and mobile modes)
3. Save charts to database
4. List user's own charts
5. Basic chart rendering
6. PDF export (simple, default formatting)
7. Public chart browsing (read-only for non-users)
8. Basic search (by title/artist)

### Nice to Have (if time allows)
1. Chart rating (upvote/downvote)
2. Comments on charts
3. Chart visibility settings
4. Multiple charts per song (ranked by votes)

### Deferred to v2
1. Real-time collaboration
2. Chart transposition tool in UI
3. Advanced search/filtering
4. User profiles with chart collections
5. Social features (following, favorites)
6. Custom PDF formatting options
7. Mobile apps (iOS/Android)

## Design Considerations

### Performance
- Cache public charts in memory (Redis in production)
- Lazy load comments (paginated)
- Debounce search queries
- Optimize PDF generation (consider server-side for large charts)

### Security
- Validate all user input
- Sanitize chart content (prevent XSS)
- Rate limit API endpoints (especially search, comments)
- HTTPS only in production
- CORS configured properly
- SQL injection prevention (EF Core parameterization)

### SEO (for public charts)
- Server-side rendering for public chart pages (use Razor views)
- Meta tags with chart title, artist, key
- Sitemap generation
- robots.txt
- Open Graph tags for social sharing

### Accessibility
- Keyboard navigation in editor
- ARIA labels for screen readers
- High contrast mode support
- Focus indicators
- Mobile accessibility (large touch targets)

## Questions / Decisions Needed
- [ ] Which OAuth provider(s) to implement first?
- [ ] Should we support offline editing (PWA with local storage)?
- [ ] Do we need admin panel for moderation?
- [ ] How to handle duplicate charts (same song, different versions)?
- [ ] Monetization strategy (ads placement, premium features)?

---

**Next Steps:**
1. Set up .NET solution structure
2. Configure EF Core and create migrations
3. Set up React project with Vite
4. Implement basic authentication
5. Build chart editor prototype
6. Implement chart storage and retrieval
7. Build PDF export functionality
