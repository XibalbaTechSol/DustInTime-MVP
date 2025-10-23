// Original location: /home/xibalbasolutions/Desktop/DustInTime-MVP/debug-frontend.sh
#!/bin/bash

# Kill any running processes that might interfere
killall -9 vite > /dev/null 2>&1
killall -9 node > /dev/null 2>&1

# Start the backend server in the background
echo "Starting backend server..."
(cd backend && npm run dev) &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for the backend to start
sleep 5

# Start the frontend server and capture output
echo "Starting frontend server..."
npm run dev > frontend-debug.log 2>&1
echo "Frontend server process finished. Checking log file."

# Display the log file
cat frontend-debug.log
