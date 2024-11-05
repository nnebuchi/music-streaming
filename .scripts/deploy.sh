#!/bin/bash

echo "Deployment started ..."


# Install dependencies based on lock file

npm install

# Run Migrations

npx prisma migrate deploy

# Restart application
pm2 restart api-server || pm2 start app.js --name api-server

echo "Application deployed!"