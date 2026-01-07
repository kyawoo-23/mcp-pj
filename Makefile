.PHONY: all dev install chat-agent uni-booking uni-registration

# Default target
all: dev

# Install dependencies for all projects
install:
	cd chat-agent && pnpm install
	cd uni-booking && pnpm install
	cd uni-registration && pnpm install

# Run all projects in parallel
dev:
	@echo "Starting all projects..."
	$(MAKE) -j3 chat-agent uni-booking uni-registration

# Individual project targets
chat-agent:
	cd chat-agent && pnpm run dev

uni-booking:
	cd uni-booking && pnpm run dev

uni-registration:
	cd uni-registration && pnpm run dev
