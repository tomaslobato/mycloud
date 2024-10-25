package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"github.com/tomaslobato/mycloud/auth"
	"github.com/tomaslobato/mycloud/handlers"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("failed to load .env")
	}
	storagePath := os.Getenv("ROOT")

	envPath := filepath.Join(storagePath, ".env")
	err = godotenv.Load(envPath)
	if err != nil {
		log.Fatal("Failed to load env file. Run `make setup` first.")
	}

	requiredEnvVars := []string{"APP_PASSWORD", "JWT_SECRET"}
	for _, env := range requiredEnvVars {
		if os.Getenv(env) == "" {
			log.Fatalf("Required environment variable %s is not set", env)
		}
	}

	app := fiber.New()

	app.Use(logger.New())

	setupRoutes(app)

	app.Listen(":5555")
}

func setupRoutes(app *fiber.App) {
	handlers.HandleFrontRoutes(app, []string{"/"})

	api := app.Group("/api")

	api.Get("/files", handlers.GetFiles)
	api.Get("/download/:id", handlers.Download)
	api.Get("/content/:id", handlers.Download)
	api.Post("/create", handlers.Create)
	api.Post("/upload", handlers.Upload)
	api.Put("/move", handlers.Move)
	api.Patch("/content/:id", handlers.SaveContent)
	api.Delete("/delete/:id", handlers.Delete)

	api.Post("/login", auth.HandleLogin)
}
