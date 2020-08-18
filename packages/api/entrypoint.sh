#!/bin/bash
set -e

# migrate if we can otherwise setup
rake db:migrate 2>/dev/null || rake db:setup
# Remove a potentially pre-existing server.pid for Rails.
rm -f /api/tmp/pids/server.pid

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"