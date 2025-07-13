#!/bin/bash

# =================================================================
#  "Nuclear Option" Clean Build Script
# =================================================================
#  This script will completely destroy and rebuild the application,
#  ensuring a clean slate and no caching issues.
# =================================================================

echo "--- STEP 1: Stopping application and deleting all data (including the database)..."
docker compose down -v

echo "--- STEP 2: Destroying all unused Docker images..."
docker image prune -a -f

echo "--- STEP 3: Destroying the Docker build cache..."
docker builder prune -f

echo "--- STEP 4: Performing final fresh build and starting application..."
docker compose up --build -d

echo ""
echo "--- CLEAN BUILD COMPLETE ---"
echo "Application is starting. You will need to perform the initial setup again."
