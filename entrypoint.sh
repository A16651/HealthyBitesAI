#!/bin/sh

BACKEND_PORT="${PORT:-8000}"

echo "Starting HealthyBitesAI..."
echo "  Backend  -> :${BACKEND_PORT}"
echo "  Frontend -> :3000"

# Start backend
uvicorn main:app --host 0.0.0.0 --port "${BACKEND_PORT}" &
BACKEND_PID=$!

# Start frontend (Next.js standalone server)
# Override PORT for this process only — Next.js reads PORT by default
cd /app/Frontend && PORT=3000 node server.js &
FRONTEND_PID=$!

# Cleanup on signal
cleanup() {
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 1
}
trap cleanup TERM INT

# Wait for either process to exit (POSIX-portable)
while kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; do
  sleep 1
done

echo "A process exited unexpectedly."
cleanup
