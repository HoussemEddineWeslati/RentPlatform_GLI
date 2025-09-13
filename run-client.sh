#!/bin/bash
echo "Starting GLI Client on port 3000..."
cd client && VITE_API_URL=http://localhost:5000 npm run dev