.PHONY: dev run build setup clean tunnel stop

# Binary names
BINARY=mycloud
SETUP_BINARY=mycloud-setup

dev:
	cd server && air & \
	cd client && node esbuild-watch.js

build: bin
	cd client && node esbuild.js
	cd server && go build -o ../bin/$(BINARY) ./cmd/mycloud
	cd server && go build -o ../bin/$(SETUP_BINARY) ./cmd/setup
	
setup: 
	cd bin && ./$(SETUP_BINARY)

run:
	docker compose up -d
	@echo "\nRunning at http://localhost:5555\n"

stop:
	docker compose down

tunnel:
	@if ! command -v cloudflared >/dev/null 2>&1; then \
		echo "Cloudflared is not installed. Installing it now..."; \
		sudo wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared; \
		sudo chmod +x /usr/local/bin/cloudflared; \
	fi
	@echo "Starting Cloudflare tunnel..."
	@echo "WARNING: wait 5 seconds after the link is shown or it may not work"
	@cloudflared tunnel --url http://localhost:5555 2>&1 | grep -o 'https://.*.trycloudflare.com'

clean:
	rm -rf bin