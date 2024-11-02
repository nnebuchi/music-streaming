#!/bin/bash

echo "Deployment started ..."


# Install dependencies based on lock file

npm install

# Restart application
pm2 reload api-server || pm2 start app.js --name api-server

echo "Application deployed!"