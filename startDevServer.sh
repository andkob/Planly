#!/bin/bash

# Generate a random JWT secret for development
RANDOM_SECRET=$(openssl rand -base64 32)

# Create .env.development file with the random secret
echo "JWT_SECRET=$RANDOM_SECRET" > .env.development

# Load Environment Variables
if [ -f .env.development ]; then
    export $(cat .env.development | grep -v '^#' | xargs)
else
    echo "Error: .env.development file not found"
    exit 1
fi

# Configuration validation
if [ -z "$JWT_SECRET" ]; then
    echo "Error: Required environment variables are not set"
    exit 1
fi

# Start the application
echo "Starting Planly development server..."
mvn spring-boot:run