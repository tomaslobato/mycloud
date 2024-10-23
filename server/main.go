package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/tomaslobato/mycloud/auth"
	"github.com/tomaslobato/mycloud/handlers"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("failed to load .env")
	}

	app := fiber.New()

	handlers.HandleFrontRoutes(app, []string{"/"})

	app.Get("/api/files", handlers.GetFiles)
	app.Get("/api/download/:id", handlers.Download)
	app.Get("/api/content/:id", handlers.Download)

	app.Post("/api/create", handlers.Create)
	app.Post("/api/upload", handlers.Upload)

	app.Put("/api/move", handlers.Move)
	app.Patch("/api/content/:id", handlers.SaveContent)

	app.Delete("/api/delete/:id", handlers.Delete)

	app.Post("/api/login", auth.HandleLogin)

	app.Listen(":5000")
}
