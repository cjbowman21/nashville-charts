# Getting Started with Nashville Charts

This guide will help you set up and run the Nashville Charts application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server LocalDB (included with Visual Studio)
- A code editor (Visual Studio, VS Code, or Rider recommended)

## Step 1: Clone and Navigate to Repository

```bash
cd nashville-charts
```

## Step 2: Set Up OAuth Authentication

You'll need to create OAuth applications with Google and Facebook to enable social login.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `https://localhost:5001/signin-google`
   - `https://localhost:5001/api/auth/callback`
7. Copy the **Client ID** and **Client Secret**

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add **Facebook Login** product to your app
4. Go to **Settings** > **Basic** and copy **App ID** and **App Secret**
5. In **Facebook Login** > **Settings**, add valid OAuth redirect URIs:
   - `https://localhost:5001/signin-facebook`
   - `https://localhost:5001/api/auth/callback`

### Update Configuration

Open `src/NashvilleCharts.Web/appsettings.Development.json` and update with your credentials:

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_GOOGLE_CLIENT_ID_HERE",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET_HERE"
    },
    "Facebook": {
      "AppId": "YOUR_FACEBOOK_APP_ID_HERE",
      "AppSecret": "YOUR_FACEBOOK_APP_SECRET_HERE"
    }
  }
}
```

**Important:** Never commit your actual credentials to git. The `.gitignore` is already configured to ignore `appsettings.Development.json`.

## Step 3: Set Up the Database

### Check SQL Server Connection

The default connection string uses LocalDB:
```
Server=(localdb)\\mssqllocaldb;Database=NashvilleCharts;Trusted_Connection=True;MultipleActiveResultSets=true
```

If you're using a different SQL Server instance, update the connection string in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=NashvilleCharts;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

### Create Database Migrations

Since we created the models and DbContext, we need to generate the initial migration:

```bash
cd src/NashvilleCharts.Web
dotnet ef migrations add InitialCreate --project ../NashvilleCharts.Infrastructure
```

### Apply Migrations to Database

```bash
dotnet ef database update --project ../NashvilleCharts.Infrastructure
```

This will create the database and all tables.

## Step 4: Restore Dependencies

### Backend (.NET)

```bash
cd src/NashvilleCharts.Web
dotnet restore
```

### Frontend (React)

```bash
cd src/NashvilleCharts.Client
npm install
```

## Step 5: Run the Application

You'll need two terminal windows - one for the backend and one for the frontend.

### Terminal 1: Start the Backend

```bash
cd src/NashvilleCharts.Web
dotnet run
```

The backend will start on `https://localhost:5001` and `http://localhost:5000`.

You should see output like:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

### Terminal 2: Start the Frontend

```bash
cd src/NashvilleCharts.Client
npm run dev
```

The frontend will start on `http://localhost:5173`.

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Nashville Charts home page!

## Verify Everything Works

1. **Home Page**: You should see the landing page with "Nashville Charts" header
2. **Browse**: Click "Browse Charts" - it should show an empty list (no charts yet)
3. **Login**: Click "Login" and try logging in with Google or Facebook
4. **Create Chart**: After logging in, go to "My Charts" - you'll see a placeholder for the chart editor

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. **Check SQL Server is running:**
   ```bash
   # For LocalDB
   sqllocaldb info
   ```

2. **Check connection string** in `appsettings.Development.json`

3. **Try creating the database manually:**
   ```bash
   dotnet ef database update --project src/NashvilleCharts.Infrastructure
   ```

### OAuth Login Issues

If OAuth login fails:

1. **Check redirect URIs** are correctly configured in Google/Facebook
2. **Ensure HTTPS** is being used for the backend (`https://localhost:5001`)
3. **Check credentials** in `appsettings.Development.json`

### Port Already in Use

If you get "port already in use" errors:

**Backend:**
Edit `src/NashvilleCharts.Web/Properties/launchSettings.json` and change the ports.

**Frontend:**
Edit `src/NashvilleCharts.Client/vite.config.js` and change `server.port`.

### CORS Issues

If you see CORS errors in the browser console:

1. Make sure both backend and frontend are running
2. Check that the frontend URL (`http://localhost:5173`) is in the CORS policy in `Program.cs`

## Next Steps

Now that you have the basic application running, here's what we need to implement next:

### Immediate Priorities (v1)

1. **Chart Editor Component** (`ChartEditor.jsx`)
   - Input field for chart metadata (title, artist, key, etc.)
   - Chart content editor with bottom sheet for chord/symbol input
   - Real-time preview
   - Save functionality

2. **Chart Viewer Component** (`ChartView.jsx`)
   - Render chart from JSON data
   - Display with proper Nashville Number notation
   - Voting buttons (upvote/downvote)
   - Comments section

3. **Chart Renderer** (shared component)
   - Parse JSON chart data
   - Render with proper symbols (diamonds, push marks, etc.)
   - Responsive layout
   - Print-friendly CSS

4. **PDF Export**
   - Use jsPDF or similar library
   - Generate PDF from rendered chart
   - Download functionality

### Future Features (v2+)

- Transposition tool
- Radial wheel input method
- Real-time collaboration
- Advanced search and filtering
- User profiles
- Chart collections/folders
- Mobile apps

## Development Workflow

### Making Changes

1. **Backend changes**: Edit files in `src/NashvilleCharts.Web`, `Core`, or `Infrastructure`
   - The app will hot-reload automatically

2. **Frontend changes**: Edit files in `src/NashvilleCharts.Client/src`
   - Vite will hot-reload in the browser

3. **Database changes**:
   ```bash
   cd src/NashvilleCharts.Web
   dotnet ef migrations add YourMigrationName --project ../NashvilleCharts.Infrastructure
   dotnet ef database update --project ../NashvilleCharts.Infrastructure
   ```

### Testing API Endpoints

The backend includes Swagger for API testing:
```
https://localhost:5001/swagger
```

### Project Structure Reference

```
nashville-charts/
├── src/
│   ├── NashvilleCharts.Web/           # ASP.NET Core backend
│   │   ├── Controllers/               # API controllers
│   │   ├── Models/DTOs/               # Data transfer objects
│   │   └── Program.cs                 # App configuration
│   │
│   ├── NashvilleCharts.Core/          # Domain models and interfaces
│   │   ├── Entities/                  # Database entities
│   │   └── Interfaces/                # Repository interfaces
│   │
│   ├── NashvilleCharts.Infrastructure/ # Data access
│   │   ├── Data/                      # DbContext
│   │   └── Repositories/              # Repository implementations
│   │
│   └── NashvilleCharts.Client/        # React frontend
│       ├── src/
│       │   ├── components/            # React components
│       │   ├── pages/                 # Page components
│       │   ├── services/              # API service layer
│       │   └── contexts/              # React contexts
│       └── package.json
│
├── ARCHITECTURE.md                    # Technical architecture
├── CHART_SYNTAX.md                    # Nashville Number System guide
└── README.md                          # Project overview
```

## Getting Help

- **Architecture Questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Chart Syntax**: See [CHART_SYNTAX.md](./CHART_SYNTAX.md)
- **API Reference**: Visit `https://localhost:5001/swagger` when running
- **Issues**: Create an issue in the repository

## Ready to Code!

You're all set! The basic infrastructure is in place. Next, we'll implement the chart editor and viewer components to bring the Nashville Number System charts to life.

Happy coding! 🎵
