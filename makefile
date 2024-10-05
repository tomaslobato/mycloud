.PHONY: run

dev:
	@echo "Starting frontend watch and backend server..."
	(pnpm watch & air) && wait
