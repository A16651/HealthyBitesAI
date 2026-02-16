#!/bin/sh

# =============================================================================
# HealthyBitesAI — Production Entrypoint
#
# Architecture:
#   - FastAPI backend  → always binds to port 8000
#   - Next.js frontend → binds to internal port 3000 (not publicly exposed)
#   - FastAPI reverse-proxies all non-API requests to Next.js internally
# =============================================================================

BACKEND_PORT=8000
INTERNAL_FRONTEND_PORT=3000

echo "============================================="
echo " HealthyBitesAI — Starting services"
echo "============================================="
echo "  Backend  (public)   -> :${BACKEND_PORT}"
echo "  Frontend (internal) -> :${INTERNAL_FRONTEND_PORT}"
echo "============================================="

# ---- Start Next.js on a fixed internal port ----
cd /app/Frontend && PORT=${INTERNAL_FRONTEND_PORT} HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!
echo "Next.js started (PID: ${FRONTEND_PID}) on :${INTERNAL_FRONTEND_PORT}"

# Wait a moment for Next.js to bind
sleep 2

# ---- Start FastAPI strictly on port 8000 ----
cd /app && uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "FastAPI started (PID: ${BACKEND_PID}) on :8000"

# ---- Graceful shutdown handler ----
cleanup() {
  echo ""
  echo "Shutting down services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "All services stopped."
  exit 0
}
trap cleanup TERM INT QUIT

# ---- Wait for either process to exit ----
while kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; do
  sleep 1
done

echo "ERROR: A process exited unexpectedly!"
echo "  Backend  PID ${BACKEND_PID}: $(kill -0 $BACKEND_PID 2>/dev/null && echo 'running' || echo 'STOPPED')"
echo "  Frontend PID ${FRONTEND_PID}: $(kill -0 $FRONTEND_PID 2>/dev/null && echo 'running' || echo 'STOPPED')"
cleanup
