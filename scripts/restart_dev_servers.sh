#!/bin/bash
echo "Killing existing vite processes..."
pkill -f vite
sleep 2 # Give time for processes to be killed
echo "Starting client-app dev server..."
cd /home/xibalbasolutions/Desktop/DustInTime-MVP/client-app && npm run dev > /home/xibalbasolutions/.gemini/tmp/2c79c87cf2d79f7604e60a763325e5b06263f90ecbf729e20b6ca7fa46e74ae9/client-app.log 2>&1 &
echo "Starting cleaner-app dev server..."
cd /home/xibalbasolutions/Desktop/DustInTime-MVP/cleaner-app && npm run dev > /home/xibalbasolutions/.gemini/tmp/2c79c87cf2d79f7604e60a763325e5b06263f90ecbf729e20b6ca7fa46e74ae9/cleaner-app.log 2>&1 &
echo "Development servers are restarting. It may take a moment for them to be ready."
