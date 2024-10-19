.PHONY: dev run build

dev:
	cd server && air & \
	cd client && node esbuild-watch.js

build:
	cd client && node esbuild.js && cd ../server && go build -o ./tmp/main

run:
	cd server && go run main.go