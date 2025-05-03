#!/bin/bash
# Environment Variables Setup Script for Spring Boot
# Save this as run-auth-service.sh in your project root directory

# Set Database Connection Variables
export DB_URL="jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
export DB_USERNAME="postgres.ruxoxiizylnopjpkbghh"
export DB_PASSWORD="BKk9xDeaoXjnUZlr"

# Set JWT Secret
export JWT_SECRET="DUIFNBVDFOV548N04V8VN043V5I845N80N485048N5V90485NV04N5"

# Set Frontend URL
export FRONTEND_URL="http://localhost:5173"
export LEAVE_URL="http://localhost:3000/api"

# Set Google OAuth2 Variables
export GOOGLE_CLIENT_ID="1047104665535-v37vqapk98318nlf31clfokb1jeikld9.apps.googleusercontent.com"

# Echo the variables for confirmation
echo "Environment variables set:"
echo "DB_URL=$DB_URL"
echo "DB_USERNAME=$DB_USERNAME"
echo "Frontend URL=$FRONTEND_URL"
echo "Google Client ID=$GOOGLE_CLIENT_ID"
echo ""