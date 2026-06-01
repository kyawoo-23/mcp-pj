.PHONY: all dev install setup env-init chat-agent uni-booking uni-registration home mcp-server edge-functions db-start db-stop db-status db-reset db-gen ip

# LAN IP for device testing on the same network (macOS: en0/en1, Windows: active adapter)
ifeq ($(OS),Windows_NT)
LOCAL_IP := $(shell powershell -NoProfile -Command "(Get-NetIPConfiguration | Where-Object { $$_.IPv4DefaultGateway -ne $$null -and $$_.NetAdapter.Status -ne 'Disconnected' } | Select-Object -First 1 -ExpandProperty IPv4Address | Select-Object -ExpandProperty IPAddress)")
else
LOCAL_IP := $(shell sh -c 'for iface in en0 en1 en2; do ip=$$(ipconfig getifaddr $$iface 2>/dev/null); if [ -n "$$ip" ]; then echo $$ip; exit 0; fi; done; ip=$$(hostname -I 2>/dev/null | awk "{print \$$1}"); if [ -n "$$ip" ]; then echo $$ip; else echo 127.0.0.1; fi')
endif

# Default target
all: dev

# Bootstrap local development
setup: env-init install db-start db-reset db-gen

# Initialize local env files from templates (non-destructive)
env-init:
	@test -f chat-agent/.env.local || cp chat-agent/.env.example chat-agent/.env.local
	@test -f uni-booking/.env.local || cp uni-booking/.env.example uni-booking/.env.local
	@test -f uni-registration/.env.local || cp uni-registration/.env.example uni-registration/.env.local
	@test -f home/.env.local || cp home/.env.example home/.env.local
	@test -f mcp-server/.env || cp mcp-server/.env.example mcp-server/.env

# Install dependencies for all projects
install:
	cd chat-agent && pnpm install
	cd uni-booking && pnpm install
	cd uni-registration && pnpm install
	cd home && pnpm install
	cd mcp-server && bun install

# Print this machine's LAN IP (same as LOCAL_IP)
ip:
	@echo $(LOCAL_IP)

# Run all projects in parallel
dev:
	@echo "Starting all projects..."
	@echo "LAN IP: $(LOCAL_IP)  (make ip)"
	$(MAKE) -j6 chat-agent uni-booking uni-registration home mcp-server edge-functions

# Individual project targets
chat-agent:
	cd chat-agent && pnpm run dev

uni-booking:
	cd uni-booking && pnpm run dev

uni-registration:
	cd uni-registration && pnpm run dev

home:
	cd home && pnpm run dev

mcp-server:
	cd mcp-server && bun run dev

edge-functions:
	supabase functions serve 

# Database commands
db-start:
	supabase start

db-stop:
	supabase stop

db-status:
	supabase status

db-reset:
	supabase db reset

db-gen:
	supabase gen types typescript --local > supabase/types/database.types.ts
