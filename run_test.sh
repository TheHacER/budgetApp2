#!/bin/bash

# =================================================================
#  Automated Test Script for Family Budget App
# =================================================================
#  This script will:
#  1. Completely reset the application and database.
#  2. Restart the application.
#  3. Set up all necessary test data for June.
#  4. Run the final dashboard test.
# =================================================================

# --- Configuration ---
BASE_URL="http://money.local"
USER_EMAIL="stuart_hobbs@icloud.com"
USER_PASSWORD="Georgia"
# Make sure this file exists in your home directory on the Pi
CSV_FILE_PATH="/home/stuart/activity.csv"


# --- Helper Functions ---
function echo_step {
  echo "-----------------------------------------------------"
  echo "STEP: $1"
  echo "-----------------------------------------------------"
}

# --- Main Script ---

# 1. Reset the Environment
echo_step "Stopping application and clearing all data..."
cd ~/family-budget-app || exit
docker compose down -v
echo "Environment cleared."
echo

# 2. Restart the Application
echo_step "Restarting application in the background..."
docker compose up -d
echo "Waiting for services to start..."
sleep 15 # Wait 15 seconds for the server to be ready
echo "Services should be running."
echo

# 3. Set Up Test Data
echo_step "Setting up test data..."

# 3a. Register User
echo "Registering user: $USER_EMAIL"
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$USER_EMAIL\", \"password\":\"$USER_PASSWORD\"}" $BASE_URL/api/auth/register
echo

# 3b. Login and Capture Token
echo "Logging in to get auth token..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$USER_EMAIL\", \"password\":\"$USER_PASSWORD\"}" $BASE_URL/api/auth/login)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get login token. Exiting."
  exit 1
fi
echo "Login successful. Token captured."
echo

# 3c. Upload Transactions
echo "Uploading transactions from $CSV_FILE_PATH..."
curl -s -X POST -H "Authorization: Bearer $TOKEN" -F "transactionsFile=@$CSV_FILE_PATH" $BASE_URL/api/transactions/upload
echo
echo

# 3d. Create Categories
echo "Creating 'Groceries' category and 'Supermarket' subcategory..."
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Groceries"}' $BASE_URL/api/categories > /dev/null
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Supermarket"}' $BASE_URL/api/categories/1/subcategories > /dev/null
echo "Categories created."
echo

# 3e. Categorize a June Transaction
echo "Finding a transaction from June to categorize..."
# Get the ID of the first uncategorized transaction
TX_ID=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/transactions/uncategorized | jq '.[0].id')

if [ "$TX_ID" == "null" ] || [ -z "$TX_ID" ]; then
  echo "WARNING: Could not find an uncategorized transaction to categorize."
else
  echo "Found transaction with ID: $TX_ID. Categorizing it..."
  curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"subcategory_id":1}' $BASE_URL/api/transactions/$TX_ID/categorize
  echo "Transaction categorized."
fi
echo

# 3f. Set Budget for June
echo "Setting budget for June..."
curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"subcategory_id":1, "year":2025, "month":6, "amount":500}' $BASE_URL/api/budgets > /dev/null
echo "Budget set."
echo

# 4. Run Final Test
echo_step "Running final dashboard test..."
curl -H "Authorization: Bearer $TOKEN" $BASE_URL/api/dashboard/monthly-summary
echo
echo
echo "-----------------------------------------------------"
echo "TEST COMPLETE."
echo "-----------------------------------------------------"
