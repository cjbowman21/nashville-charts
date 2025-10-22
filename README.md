# Nashville Charts

A mobile-first web application for creating, sharing, and discovering Nashville Number System charts.

## What is the Nashville Number System?

The Nashville Number System (NNS) is a method of transcribing music by denoting chords as numbers (I-VII) based on their scale degree. Developed in the late 1950s by Neal Matthews Jr., it's the standard for studio musicians and songwriters because charts remain valid when transposing to different keys.

## Features

### v1 (Current Development)
- **User Authentication** - OAuth login (Google, Microsoft, GitHub)
- **Mobile-First Chart Editor**
  - Radial wheel picker for intuitive mobile editing
  - Power mode with text input for desktop users
  - Real-time chart preview
- **Chart Management** - Create, save, edit, and delete your charts
- **Public Chart Repository** - Browse and search community charts
- **PDF Export** - Export charts for printing or sharing
- **Voting System** - Upvote/downvote charts to surface the best versions
- **Comments** - Discuss and collaborate on charts

### v2 (Planned)
- Chart transposition tool
- Real-time collaboration
- User profiles and chart collections
- Advanced search and filtering
- Custom PDF formatting
- Mobile apps (iOS/Android)

## Technology Stack

- **Backend**: .NET 8 MVC, Entity Framework Core, SQL Server
- **Frontend**: React 18, Bootstrap 5, Vite
- **Authentication**: ASP.NET Core Identity with OAuth 2.0
- **PDF Generation**: jsPDF or pdfmake

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server LocalDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nashville-charts.git
   cd nashville-charts
   ```

2. **Set up the database**
   ```bash
   cd src/NashvilleCharts.Web
   dotnet ef database update
   ```

3. **Configure OAuth providers**
   - Copy `appsettings.example.json` to `appsettings.Development.json`
   - Add your OAuth client IDs and secrets

4. **Start the backend**
   ```bash
   cd src/NashvilleCharts.Web
   dotnet run
   ```
   Backend runs at `https://localhost:5001`

5. **Start the frontend**
   ```bash
   cd src/NashvilleCharts.Client
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
nashville-charts/
├── src/
│   ├── NashvilleCharts.Web/           # ASP.NET Core MVC backend
│   ├── NashvilleCharts.Core/          # Business logic
│   ├── NashvilleCharts.Infrastructure/# Data access layer
│   └── NashvilleCharts.Client/        # React frontend
├── tests/
├── docs/
└── README.md
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md) - Technical architecture and design decisions
- [Chart Syntax Guide](./CHART_SYNTAX.md) - How to write charts using Nashville Number System
- [API Documentation](./docs/API.md) - REST API endpoints (coming soon)
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute (coming soon)

## Nashville Number System Quick Reference

| Symbol | Meaning | Example |
|--------|---------|---------|
| I, II, III, IV, V, VI, VII | Major chords | I = C major (in key of C) |
| Im or I- | Minor chord | VIm = A minor (in key of C) |
| ◇I | Diamond - whole note | Hold chord for full measure |
| <I | Push symbol - syncopate earlier | Attack 1/8 note earlier |
| ^I | Staccato/choke | Stop chord immediately |
| I/III | Slash chord | C with E in bass (in key of C) |
| Underline | Multiple chords per measure | I IV = two beats each |

## Example Chart

**Amazing Grace** (Key of G)
```
[Verse]
I      I      IV     I
I      I      V      V
I      I      IV     I
I      V      I      I
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Neal Matthews Jr. and the Jordanaires for developing the Nashville Number System
- The Nashville music community for refining and popularizing this notation system
- All contributors and users of Nashville Charts

## Contact

- Issues: [GitHub Issues](https://github.com/yourusername/nashville-charts/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/nashville-charts/discussions)

## Roadmap

See our [project board](https://github.com/yourusername/nashville-charts/projects) for upcoming features and progress.

---

**Status**: 🚧 In Active Development

Made with ❤️ for the music community
