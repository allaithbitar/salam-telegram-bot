#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  # Run the production server
  bun run build
  bun run start:production
else
  # Run the development server
  bun run dev
fi
