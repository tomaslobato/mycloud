## MyCloud
Self hosted secure cloud/text editor application.

## Getting your self hosted cloud running
1. Get the docker image: tomaslobato/mycloud.
2. Run `make setup`, you'll be asked to select a folder and set your password.
3. Run `make run` check if it's running accessing the IP address logged from a browser on your local network.
4. Log in to [cloudflare]("https://cloudflare.com") and [install cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/)
5. Run `make tunnel` to create a cloudflare tunnel, you can set a specific domain or use the free ones cloudflare provides.
6. Enjoy accessing, editing or playing your files privately from anywhere in the world.