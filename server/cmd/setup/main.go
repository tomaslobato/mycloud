package main

import (
	"bufio"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"strings"
)

func expandHomeDir(path string) (string, error) {
	if !strings.HasPrefix(path, "~/") {
		return path, nil
	}

	usr, err := user.Current()
	if err != nil {
		return "", fmt.Errorf("getting current user: %v", err)
	}

	return filepath.Join(usr.HomeDir, path[2:]), nil
}

func main() {
	fmt.Println("\nWelcome to MyCloud!")

	reader := bufio.NewReader(os.Stdin)

	var rootDir string
	for {
		fmt.Println("\nEnter the path for your MyCloud storage (empty for ~/mycloud): ")
		input, _ := reader.ReadString('\n')
		rootDir = strings.TrimSpace(input)

		if rootDir == "" {
			rootDir = "~/mycloud"
		}

		expandedPath, err := expandHomeDir(rootDir)
		if err != nil {
			fmt.Printf("❌ Error expanding path: %v\n", err)
			continue
		}

		absPath, err := filepath.Abs(expandedPath)
		if err != nil {
			fmt.Printf("❌ Error with path: %v\n", err)
			continue
		}
		rootDir = absPath

		_, err = os.Stat(rootDir)
		if os.IsNotExist(err) {
			fmt.Println("Dir doesn't exist, create it? (y/n):")
			confirm, _ := reader.ReadString('\n')
			if strings.ToLower(strings.TrimSpace(confirm)) == "y" {
				err := os.MkdirAll(rootDir, 0755)
				if err != nil {
					fmt.Printf("❌ Error creating directory: %v\n", err)
					continue
				}
			} else {
				continue
			}
		}
		break
	}

	var password string
	for {
		fmt.Print("\nEnter your new MyCloud password (min 8 characters): ")
		pass, _ := reader.ReadString('\n')
		password = strings.TrimSpace(pass)

		if len(password) < 8 {
			fmt.Println("❌ Password must be at least 8 characters long")
			continue
		}

		fmt.Print("Confirm password: ")
		confirmPass, _ := reader.ReadString('\n')
		confirmPass = strings.TrimSpace(confirmPass)

		if password != confirmPass {
			fmt.Println("❌ Passwords don't match")
			continue
		}
		break
	}

	envPath := filepath.Join(filepath.Join(rootDir), ".env")
	envContent := fmt.Sprintf(`
		APP_PASSWORD=%s
		JWT_SECRET=%s`,
		password, generateJWTSecret(32))

	//create root .env
	if err := os.WriteFile(envPath, []byte(envContent), 0600); err != nil {
		fmt.Printf("❌ Error creating .env file: %v\n", err)
		os.Exit(1)
	}

	//create local env to find the root folder
	localEnvContent := fmt.Sprintf("ROOT=%s", rootDir)
	if err := os.WriteFile(".env", []byte(localEnvContent), 0600); err != nil {
		fmt.Printf("❌ Error creating local .env file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\n✅ Setup completed successfully!\n")
	fmt.Printf("\nRun `make run` to start your MyCloud server")
	fmt.Printf("\nRun `make tunnel` to securely tunnel your server to the internet with Cloudflare\n")
}

func generateJWTSecret(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[int(os.Getpid()+i)%len(charset)]
	}
	return string(b)
}
