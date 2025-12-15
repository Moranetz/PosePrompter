# How to Keep Servers Running - Never Lose Connection Again

This guide shows you multiple ways to ensure your servers stay running and your connection never fails.

## 🚀 Quick Start (Easiest Method)

### Option 1: Double-Click Startup (Recommended)
1. **Double-click `start-servers.bat`** in the project root
2. Both servers will start automatically
3. Keep the terminal window open while using the app

### Option 2: Command Line
```bash
npm run dev:all
```

This starts both servers in one terminal with colored output.

## 📋 All Available Methods

### Method 1: Using the Startup Script (Easiest)

**Windows:**
- Double-click `start-servers.bat`
- Or right-click → "Run with PowerShell" on `start-servers.ps1`

**What it does:**
- Checks if Node.js and npm are installed
- Installs dependencies if missing
- Starts both backend and frontend servers
- Shows colored output for each server

### Method 2: Using npm Script

```bash
npm run dev:all
```

This uses `concurrently` to run both servers in one terminal.

### Method 3: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🔍 Check if Servers Are Running

### Quick Health Check
Run the health check script:
```bash
powershell -ExecutionPolicy Bypass -File check-servers.ps1
```

Or double-click `check-servers.ps1`

### Manual Check
- **Backend:** Open http://localhost:3001/api/health in your browser
- **Frontend:** Open http://localhost:5173 in your browser

### Check Ports
```bash
netstat -ano | findstr ":3001"
netstat -ano | findstr ":5173"
```

## 🛡️ Keep Servers Running After Closing Terminal

### Option 1: Use Windows Task Scheduler (Recommended)

1. **Open Task Scheduler** (search "Task Scheduler" in Windows)
2. **Create Basic Task:**
   - Name: "PosePrompt Studio Servers"
   - Trigger: "When I log on" or "At startup"
   - Action: "Start a program"
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\Users\Mario\Downloads\PosePrompt Studio\start-servers.ps1"`
   - Start in: `C:\Users\Mario\Downloads\PosePrompt Studio`

3. **Settings:**
   - Check "Run whether user is logged on or not"
   - Check "Run with highest privileges"

### Option 2: Use PM2 (Process Manager)

Install PM2 globally:
```bash
npm install -g pm2
```

Start servers with PM2:
```bash
# Start backend
cd server
pm2 start npm --name "poseprompt-backend" -- run dev

# Start frontend (in root directory)
cd ..
pm2 start npm --name "poseprompt-frontend" -- run dev
```

PM2 commands:
- `pm2 list` - See running processes
- `pm2 logs` - View logs
- `pm2 restart all` - Restart all
- `pm2 stop all` - Stop all
- `pm2 save` - Save current process list
- `pm2 startup` - Auto-start on boot

### Option 3: Use NSSM (Non-Sucking Service Manager)

1. Download NSSM from https://nssm.cc/download
2. Install as Windows Service:
```bash
nssm install PosePromptBackend "C:\Program Files\nodejs\node.exe" "C:\Users\Mario\Downloads\PosePrompt Studio\server\server.js"
nssm install PosePromptFrontend "C:\Program Files\nodejs\node.exe" "C:\Users\Mario\Downloads\PosePrompt Studio\node_modules\.bin\vite"
```

## 🔄 Auto-Restart on Crash

### Using PM2 (Recommended)
PM2 automatically restarts crashed processes:
```bash
pm2 start npm --name "poseprompt-backend" -- run dev --watch
pm2 start npm --name "poseprompt-frontend" -- run dev --watch
```

### Using nodemon (Backend only)
The backend already uses `node --watch` which auto-restarts on file changes.

## 📊 Monitor Server Status

### Create a Monitoring Script

Create `monitor-servers.ps1`:
```powershell
while ($true) {
    Clear-Host
    Write-Host "Monitoring servers..." -ForegroundColor Cyan
    & ".\check-servers.ps1"
    Start-Sleep -Seconds 30
}
```

Run it to continuously monitor:
```bash
powershell -ExecutionPolicy Bypass -File monitor-servers.ps1
```

## 🚨 Troubleshooting

### Servers Won't Start

1. **Check if ports are in use:**
   ```bash
   netstat -ano | findstr ":3001"
   netstat -ano | findstr ":5173"
   ```

2. **Kill processes on ports:**
   ```bash
   # Find PID from netstat output, then:
   taskkill /PID <PID> /F
   ```

3. **Check dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

### Connection Errors

1. **Verify servers are running:**
   - Run `check-servers.ps1`
   - Or visit http://localhost:3001/api/health

2. **Check environment variables:**
   - Ensure `.env.local` exists in root
   - Ensure `server/.env` exists
   - Verify `VITE_API_BASE_URL=http://localhost:3001` in `.env.local`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R`
   - Or clear browser cache

### Servers Stop Unexpectedly

1. **Check logs** for error messages
2. **Check Windows Event Viewer** for system errors
3. **Verify Node.js version:** `node --version` (should be 16+)
4. **Check disk space** - servers need space for logs

## 💡 Best Practices

1. **Always use the startup script** (`start-servers.bat`) for consistency
2. **Keep the terminal window open** while developing
3. **Use PM2 for production-like setup** if you need servers running 24/7
4. **Monitor server health** regularly with `check-servers.ps1`
5. **Set up auto-start** if you use the app daily

## 📝 Quick Reference

| Task | Command |
|------|---------|
| Start both servers | `npm run dev:all` or `start-servers.bat` |
| Check server status | `check-servers.ps1` |
| Start backend only | `cd server && npm run dev` |
| Start frontend only | `npm run dev` |
| Stop servers | `Ctrl+C` in terminal |
| Kill port 3001 | `netstat -ano \| findstr :3001` then `taskkill /PID <PID> /F` |
| Kill port 5173 | `netstat -ano \| findstr :5173` then `taskkill /PID <PID> /F` |

## 🎯 Recommended Setup for Daily Use

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start servers with PM2:**
   ```bash
   cd server
   pm2 start npm --name "poseprompt-backend" -- run dev
   cd ..
   pm2 start npm --name "poseprompt-frontend" -- run dev
   pm2 save
   ```

3. **Set PM2 to start on boot:**
   ```bash
   pm2 startup
   # Follow the instructions it gives you
   ```

4. **Your servers will now:**
   - Start automatically on boot
   - Restart automatically if they crash
   - Run in the background
   - Be accessible via `pm2 list` and `pm2 logs`

Now your servers will stay running and your connection will never fail! 🎉

