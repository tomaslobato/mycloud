.PHONY: dev run build bin setup clean tunnel

# Binary names
BINARY=mycloud
SETUP_BINARY=mycloud-setup

dev:
	cd server && air & \
	cd client && node esbuild-watch.js

build: bin
	cd client && node esbuild.js
	cd server && go build -o ../bin/$(BINARY) ./cmd/mycloud/main.go
	cd server && go build -o ../bin/$(SETUP_BINARY) ./cmd/setup/main.go

bin:
	mkdir -p bin

setup: 
	cd server && go build -o ../bin/$(SETUP_BINARY) ./cmd/setup/main.go
	cd bin && ./$(SETUP_BINARY)

run:
	cd server && go build -o ../bin/$(BINARY) ./cmd/mycloud/main.go
	cd bin && ./$(BINARY)

tunnel:
	@if ! command -v cloudflared >/dev/null 2>&1; then \
		echo "Cloudflared is not installed. Installing it now..."; \
		sudo wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared; \
		sudo chmod +x /usr/local/bin/cloudflared; \
	fi
	@echo "Starting Cloudflare tunnel..."
	@echo "WARNING: wait 5 seconds after the link is shown or it may not work"
	@cloudflared tunnel --url http://localhost:5000 2>&1 | grep -o 'https://.*.trycloudflare.com'

clean:
	rm -rf bin