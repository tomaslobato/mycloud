.PHONY: run

dev:
	@echo "Starting frontend watch and backend server..."
	@pnpm watch & \
	air

run:
	@go run main.go