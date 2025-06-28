# WPI Arena

<div align="center">
  <img src="./web/static/favicon.png" alt="WPI Arena Logo" width="100" height="100">
  <h3>WPI Arena</h3>
  <p>Everything you need to manage a Combat Robot system</p>
</div>

---

## 🏆 Features

- **Real-time Match Management**: Control robot competitions with live timer and status updates
- **Multiple Display Views**: Separate interfaces for operators, referees, stream, and robots
- **Tournament Integration**: Connect with TrueFinals API for tournament management
- **Sound Effects**: Audio feedback for match events (start, KO, tapout, winner)
- **WebSocket Communication**: Real-time updates across all connected displays
- **OBS Studio Integration**: Transparent background support for streaming overlays
- **Professional UI**: Modern, responsive design with combat-themed styling

## 🎯 Display Types

- **🎛️ Operator Panel**: Main control interface for match manager
- **⏱️ Timer Display**: Large format timer for venue displays
- **👨‍⚖️ Referee Panel**: Referee controls for match decisions and timer
- **👥 Audience Display**: Spectator view with match information
- **🤖 Robot Displays**: Individual robot status displays (Robot 1 & Robot 2)

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

1. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd wpi-arena
   ```

2. **Install Dependencies:**
   ```bash
   # Setup web interface
   cd web
   yarn install
   yarn build
   
   # Setup server
   cd ../server
   yarn install
   yarn build
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the Application:**
   ```bash
   yarn start
   ```

5. **Access the Interface:**
   Open your browser to `http://localhost:3000` (or your configured port)

## 🔧 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **Yarn** package manager
- **TrueFinals API access** (for tournament integration)

### Detailed Setup

1. **Set up the web interface:**
   ```bash
   cd web
   yarn install
   yarn build
   ```

2. **Set up the server:**
   ```bash
   cd server
   yarn install
   yarn build
   ```

3. **Create environment configuration:**
   ```bash
   cp server/.env.example server/.env
   ```

## 🔐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| `TF_API_USER` | TrueFinals API username | ✅ | `your-username` |
| `TF_API_KEY` | TrueFinals API authentication key | ✅ | `your-api-key` |
| `TF_TOURNAMENT_ID` | ID of the tournament in TrueFinals | ✅ | `12345` |
| `TOURNAMENT_NAME` | Display name of the tournament | ✅ | `"WPI Robot Competition"` |
| `PORT` | Server port number | ❌ | `3000` (default) |
| `IP` | Server IP address | ❌ | `localhost` (default) |
| `MATCH_TIME` | Default match duration in seconds | ✅ | `180` (3 minutes) |

### Example `.env` file:
```bash
TF_API_USER=myusername
TF_API_KEY=abcd1234efgh5678
TF_TOURNAMENT_ID=12345
TOURNAMENT_NAME=WPI Robot Arena Championship
PORT=3000
IP=0.0.0.0
MATCH_TIME=180
```

## 🎮 Usage

### Starting a Match

1. **Access the Operator Panel** at `/operator`
2. **Load a match** either:
   - Create a test match with custom robots
   - Load a tournament match from TrueFinals (requires API key and Tournament ID)
3. **Set robot ready status** for both competitors
4. **Start the timer** when ready
5. **Declare winner** when match concludes

### Display Setup

For competitions, set up multiple displays:

- **Main Operator Display**: `/operator` - For match control
- **Timer Display**: `/displays/timer` - Large venue timer
- **Audience Display**: `/displays/audiance` - For spectators / stream view
- **Robot Corner Displays**: `/displays/robot/1` and `/displays/robot/2`
- **Referee Display**: `/displays/ref` - For match officials

## 🔌 API Endpoints

### Match Management
- `GET /api/game_info` - Get current match state
- `POST /api/raw_match` - Load custom match
- `POST /api/load_match` - Load tournament match
- `POST /api/robot_ready` - Set robot ready status
- `POST /api/winner` - Declare match winner
- `POST /api/tap_out` - Robot tap out

### Timer Control
- `POST /api/timer` - Control timer (start/pause/resume/restart/set)

### Tournament Data
- `GET /api/tourney` - Get tournament information
- `GET /api/players` - Get all players/robots
- `GET /api/games` - Get all tournament matches

## 🛠️ Development

### Development Mode

**Server:**
```bash
cd server
yarn dev  # Auto-restart on changes
```

**Web Interface:**
```bash
cd web
yarn dev  # Development server with hot reload
```

### Available Scripts

**Server:**
- `yarn build` - Compile TypeScript
- `yarn watch` - Watch mode compilation
- `yarn dev` - Development with nodemon
- `yarn start` - Production start
- `yarn format` - Format code with Prettier
- `yarn lint` - Lint code

**Web:**
- `yarn build` - Build for production
- `yarn dev` - Development server
- `yarn preview` - Preview production build
- `yarn check` - Type checking
- `yarn format` - Format code
- `yarn lint` - Lint code

### Project Structure

```
wpi-arena/
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── arena/         # Arena management logic
│   │   ├── truefinals/    # TrueFinals API integration
│   │   └── index.ts       # Server entry point
│   └── package.json
├── web/                   # Frontend SvelteKit application
│   ├── src/
│   │   ├── routes/        # Page components
│   │   ├── lib/           # Shared utilities
│   │   └── components/    # Reusable components
│   └── package.json
└── README.md
```

## 🎨 Technology Stack

**Backend:**
- Node.js + Express
- TypeScript
- Socket.IO (WebSocket communication)
- TrueFinals API integration

**Frontend:**
- SvelteKit
- TypeScript
- TailwindCSS
- Howler.js (Audio)
- Socket.IO Client

## 🚧 Roadmap

- [ ] Check-in feature with photo capture
- [ ] Enhanced match statistics
- [ ] Multi-tournament support


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Luke Maxwell** - [lbmaxwell@wpi.edu](mailto:lbmaxwell@wpi.edu)

---

<div align="center">
  <p>Built with ❤️ for robot competitions</p>
</div>
