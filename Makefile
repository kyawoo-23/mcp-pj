.PHONY: all dev install chat-agent uni-booking uni-registration home mcp-server

# Default target
all: dev

# Install dependencies for all projects
install:
	cd chat-agent && pnpm install
	cd uni-booking && pnpm install
	cd uni-registration && pnpm install
	cd home && pnpm install
	cd mcp-server && pnpm install

# Run all projects in parallel
dev:
	@echo "Starting all projects..."
	$(MAKE) -j5 chat-agent uni-booking uni-registration home mcp-server

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
	cd mcp-server && pnpm run dev

# Database commands
db-reset:
	supabase db reset

db-gen:
	supabase gen types typescript --local > supabase/types/database.types.ts
