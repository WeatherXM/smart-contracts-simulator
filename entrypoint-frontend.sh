#!/bin/sh
# Change to the correct directory
cd /usr/src/app;
#Install dependencies
npm run setup
# Create remappings for smart contract imports
npm run createRemappings
# Compile smart-contracts
npm run compile:local;
# Deploy smart-contracts
npm run deploy:local;
# Deploy initial conditions for simulator to work
npm run simulate:local
# Change folder into the frontend
cd frontend;
# Install frontend deps
npm i
# Startup the frontend
npm run start
# Keep node alive
set -e
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi
exec "$@"