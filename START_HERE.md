# 🚀 Quick Start Guide - Keep Your Servers Running

This guide ensures your PosePrompt Studio servers **never fail** and always stay connected.

## ⚡ Quick Start (Easiest Method)

### Option 1: Use the Startup Script (Recommended)

**Double-click or run:**
```powershell
.\start-servers.ps1
```

Or use npm:
```bash
npm start
```

This script will:
- ✅ Check if servers are already running
- ✅ Start backend server (port 3001) if needed
- ✅ Start frontend server (port 5173) if needed
- ✅ Verify both servers are healthy
- ✅ Open your browser automatically

### Option 2: Use npm (Single Command)

Run both servers in one terminal:
```bash
npm run dev:all
```

This uses `concurrently` to run both servers in the same window.

## 🔍 Check Server Status

To verify both servers are running:
```powershell
.\check-servers.ps1
```

Or use npm:
```bash
npm run check
```

## 🛑 Stop All Servers

To stop both servers:
```powershell
.\stop-servers.ps1
```

Or use npm:
```bash
npm run stop
```

## 📋 Manual Start (If Scripts Don't Work)

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

## 🔧 Troubleshooting

### "Connection Failed" Error

1. **Check if servers are running:**
   ```bash
   npm run check
   ```

2. **Restart servers:**
   ```bash
   npm run stop
   npm start
   ```

3. **Check ports are free:**
   - Backend uses port **3001**
   - Frontend uses port **5173**
   - If ports are busy, the script will try to free them

### Backend Won't Start

1. **Check environment variables:**
   - Verify `server/.env` exists
   - Ensure `STRIPE_SECRET_KEY` is set
   - Ensure `FIREBASE_SERVICE_ACCOUNT` is set

2. **Check dependencies:**
   ```bash
   cd server
   npm install
   ```

### Frontend Won't Start

1. **Check environment variables:**
   - Verify `.env.local` exists in root directory
   - Ensure `VITE_API_BASE_URL=http://localhost:3001` is set

2. **Check dependencies:**
   ```bash
   npm install
   ```

### Port Already in Use

The startup script will automatically:
- Detect if ports are in use
- Kill the process using the port
- Start fresh servers

If this doesn't work, manually kill processes:
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## 💡 Pro Tips

### Keep Servers Running After Closing Terminal

**Windows:**
1. Run `start-servers.ps1` - it opens servers in separate minimized windows
2. Keep those windows open (minimized is fine)
3. Servers will keep running even if you close your main terminal

### Auto-Start on Computer Boot

1. Create a shortcut to `start-servers.ps1`
2. Add it to Windows Startup folder:
   - Press `Win + R`
   - Type: `shell:startup`
   - Copy shortcut there

### Monitor Server Health

Set up a scheduled task to check servers every 5 minutes:
```powershell
# Run this in PowerShell as Administrator
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File `"$PWD\check-servers.ps1`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)
Register-ScheduledTask -TaskName "PosePrompt Health Check" -Action $action -Trigger $trigger
```

## 📍 Server URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Backend Health:** http://localhost:3001/api/health

## ✅ Success Checklist

Before you start working, verify:
- [ ] Backend responds at http://localhost:3001/api/health
- [ ] Frontend loads at http://localhost:5173
- [ ] No connection errors in browser console (F12)
- [ ] Both servers show "running" in `npm run check`

## 🆘 Still Having Issues?

1. **Check logs:**
   - Backend: Look at the server terminal window
   - Frontend: Check browser console (F12)

2. **Verify environment files:**
   - Root: `.env.local` exists
   - Server: `server/.env` exists

3. **Restart everything:**
   ```bash
   npm run stop
   npm start
   ```

4. **Nuclear option - Full reset:**
   ```bash
   npm run stop
   # Kill any remaining Node processes
   taskkill /F /IM node.exe
   npm start
   ```

---

**Remember:** Always use `npm start` or `.\start-servers.ps1` to ensure both servers start correctly!



