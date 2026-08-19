#!/usr/bin/env bash
# Cloud Agent start phase for mcp-pj.
#
# Per-boot runtime reconciliation. Brings up the services the apps depend on and
# then returns (long-running dev servers are launched as terminals):
#   1. Docker daemon (dockerd) — required by the local Supabase stack
#   2. Local Supabase stack (Postgres + Auth + REST + Studio) with migrations+seeds
#   3. Restore the standard Supabase API-role grants on the public schema
#
# Idempotent and safe to re-run: it detects an already-running daemon/stack.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() { echo -e "\n[start] $*"; }

DOCKER="docker"
command -v docker >/dev/null 2>&1 || { echo "[start] docker not found; run install first" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Docker daemon
# ---------------------------------------------------------------------------
# Same-bridge container traffic must not be filtered by iptables/nftables in the
# nested VM, otherwise Supabase's inter-container connections time out.
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 net.bridge.bridge-nf-call-ip6tables=0 net.bridge.bridge-nf-call-arptables=0 >/dev/null 2>&1 || true

if ! sudo "$DOCKER" info >/dev/null 2>&1; then
  log "Starting dockerd"
  sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
  for i in $(seq 1 60); do
    if sudo "$DOCKER" info >/dev/null 2>&1; then break; fi
    sleep 1
  done
  if ! sudo "$DOCKER" info >/dev/null 2>&1; then
    echo "[start] dockerd did not become ready; see /tmp/dockerd.log" >&2
    tail -20 /tmp/dockerd.log >&2 || true
    exit 1
  fi
fi
# Let the ubuntu user (and thus the Supabase CLI / terminals) use the socket.
sudo chown root:docker /var/run/docker.sock 2>/dev/null || true
sudo chmod 660 /var/run/docker.sock 2>/dev/null || true
log "Docker is ready"

# Run docker/supabase as the ubuntu user via its group so no sudo is needed.
dockergrp() { sg docker -c "$*"; }

# ---------------------------------------------------------------------------
# 2. Local Supabase stack
# ---------------------------------------------------------------------------
if dockergrp "supabase status" >/dev/null 2>&1; then
  log "Supabase already running"
else
  log "Starting Supabase (first boot pulls images; this can take a few minutes)"
  dockergrp "supabase start"
fi

# ---------------------------------------------------------------------------
# 3. Restore standard Supabase API-role grants on the public schema
# ---------------------------------------------------------------------------
# Some local Supabase Postgres images ship incomplete default privileges for the
# public schema (missing INSERT/SELECT/UPDATE/DELETE for anon/authenticated/
# service_role). Re-apply the intended grants; RLS still governs row access.
DB_CONTAINER="supabase_db_mcp-pj"
log "Applying Supabase public-schema grants"
for i in $(seq 1 30); do
  if dockergrp "docker exec $DB_CONTAINER pg_isready -U postgres" >/dev/null 2>&1; then break; fi
  sleep 1
done
dockergrp "docker exec -i $DB_CONTAINER psql -U postgres -d postgres" < scripts/fix-supabase-grants.sql >/dev/null

log "Start phase complete — Supabase up; dev servers run as terminals"
