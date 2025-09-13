#!/bin/bash
echo "Starting GLI Server (API only) on port 5000..."
API_ONLY=true NODE_ENV=development tsx server/index.ts