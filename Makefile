.PHONY: dev run build-client build-server

build-client:
	cd client && node esbuild.js

build-server:
	cd server && go build -o ../tmp/main

dev:
	(cd client && node esbuild.js) & \
	(cd server && air)

run:
	cd server && go run main.go