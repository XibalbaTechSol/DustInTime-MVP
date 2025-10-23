#!/bin/bash
echo "Attempting to kill Node.js processes..."
sudo kill -9 28952 28967 40114 39278
if [ $? -eq 0 ]; then
    echo "Successfully killed processes."
else
    echo "Failed to kill some processes. Please check if they are still running."
fi