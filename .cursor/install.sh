#!/usr/bin/env bash
# Cloud Agent install phase for mcp-pj.
#
# One-time, idempotent setup that is baked into the environment snapshot:
#   - system toolchains missing from the base image (Bun, Supabase CLI, Docker,
#     fuse-overlayfs) needed to run the apps + local Supabase stack
#   - JS/TS dependencies for the four Next.js apps (pnpm) and the MCP server (Bun)
#   - local dev env files (.env.local / .env) populated with the well-known local
#     Supabase demo keys
#
# Runtime services (Docker daemon, Supabase stack) are started per-boot in
# .cursor/start.sh; the dev servers run as terminals. This script must terminate.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() { echo -e "\n[install] $*"; }

# ---------------------------------------------------------------------------
# 1. System toolchains (only install what's missing)
# ---------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then return; fi
  log "Installing Bun"
  curl -fsSL https://bun.sh/install | bash
  # Expose bun on PATH for all shells (terminals, start.sh)
  sudo ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
  sudo ln -sf "$HOME/.bun/bin/bunx" /usr/local/bin/bunx
}

ensure_supabase() {
  if command -v supabase >/dev/null 2>&1; then return; fi
  log "Installing Supabase CLI"
  local arch tmp
  arch="$(dpkg --print-architecture)"
  tmp="$(mktemp -d)"
  curl -fsSL "https://github.com/supabase/cli/releases/latest/download/supabase_linux_${arch}.tar.gz" -o "$tmp/supabase.tar.gz"
  tar -xzf "$tmp/supabase.tar.gz" -C "$tmp"
  sudo mv "$tmp/supabase" /usr/local/bin/supabase
  rm -rf "$tmp"
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1 && command -v fuse-overlayfs >/dev/null 2>&1; then return; fi
  log "Installing Docker CE + fuse-overlayfs"
  sudo install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
  fi
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -qq
  # fuse3 ships an interactive conffile prompt; force non-interactive defaults.
  sudo apt-get install -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold -qq \
    docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin fuse3 fuse-overlayfs
  # Use fuse-overlayfs so Docker works inside the (nested) Cloud Agent VM.
  sudo mkdir -p /etc/docker
  echo '{ "storage-driver": "fuse-overlayfs" }' | sudo tee /etc/docker/daemon.json >/dev/null
  # Allow the ubuntu user to talk to the daemon socket without sudo.
  sudo groupadd -f docker
  sudo usermod -aG docker "$(id -un)"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then return; fi
  log "Enabling pnpm via corepack"
  sudo corepack enable pnpm || corepack enable pnpm || true
}

ensure_bun
ensure_supabase
ensure_docker
ensure_pnpm

# ---------------------------------------------------------------------------
# 2. Application dependencies
# ---------------------------------------------------------------------------
log "Installing Next.js app dependencies (pnpm)"
for app in chat-agent uni-booking uni-registration home; do
  (cd "$app" && pnpm install --frozen-lockfile)
done

log "Installing MCP server dependencies (bun)"
(cd mcp-server && bun install)

# ---------------------------------------------------------------------------
# 3. Local env files (non-destructive create, then fill local values)
# ---------------------------------------------------------------------------
log "Preparing local env files"
make env-init

# Well-known local Supabase demo credentials (constant for local dev because the
# local stack is signed with the fixed demo JWT secret). Safe to commit/use for
# local development only.
SUPABASE_API_URL="http://127.0.0.1:23456"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

for app in chat-agent uni-booking uni-registration home; do
  f="$app/.env.local"
  sed -i "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_API_URL|" "$f"
  sed -i "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" "$f"
done

# MCP server uses the service-role client (server-to-server).
sed -i "s|^SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_API_URL|" mcp-server/.env
sed -i "s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY|" mcp-server/.env
# Disable MCP auth locally so the chat agent (no token) can call the server.
sed -i "s|^MCP_AUTH_TOKEN=.*|MCP_AUTH_TOKEN=|" mcp-server/.env

# Enable the MCP path in the chat agent so the conversational modality uses the
# MCP server (matches the study's intended wiring).
sed -i "s|^USE_MCP=.*|USE_MCP=true|" chat-agent/.env.local

# If a Gemini key was provided as a secret, wire it into the chat agent so the
# conversational LLM responses work. Without it, the traditional UIs and the MCP
# tool data-path still work fully.
if [ -n "${GOOGLE_GENERATIVE_AI_API_KEY:-}" ]; then
  sed -i "s|^GOOGLE_GENERATIVE_AI_API_KEY=.*|GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY|" chat-agent/.env.local
fi

log "Install phase complete"
