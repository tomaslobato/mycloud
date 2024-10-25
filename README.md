## MyCloud
Securely host a Web UI for a folder in your PC/Homelab, making it your cloud for editing, reading or playing your files.

### Getting your cloud running
1. Clone the repo: `git clone https://github.com/tomaslobato/mycloud.git && cd mycloud`

2. Run `make setup`, you'll be asked to select a folder and set your password.

3. Allow port :5555 in your firewall with `ufw allow 5555`

4. And do `make run`, try to access it from your local network at `192.168.<your machine local IP>:5555`

5. Run `make tunnel` to create a free cloudflare tunnel, wait 5 seconds and access the random URL.

6. Enjoy your files privately from anywhere in the world from your new URL.
