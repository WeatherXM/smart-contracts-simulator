#!/bin/sh
# Change to the correct directory
cd /usr/src/app;
cd wallet-connect-test;
# Install frontend deps
npm i -f
# Startup the frontend
npm run start
# Keep node alive
set -e
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi
exec "$@"