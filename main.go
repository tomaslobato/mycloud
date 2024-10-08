package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/tomaslobato/mycloud/server/handlers"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()

	frontRoutes := []string{
		"/",
	}

	handlers.HandleFrontRoutes(app, frontRoutes)

	app.Get("/api/files", handlers.Get)

	app.Put("/api/move", handlers.Move)

	app.Post("/api/upload", handlers.Upload)

	app.Post("/api/create", handlers.Create)

	app.Delete("/api/delete/:id", handlers.Delete)

	app.Get("/api/download/:id", handlers.Download)

	app.Get("/api/content/:id", handlers.GetContent)

	app.Patch("/api/content/:id", handlers.SaveContent)

	app.Listen(":5000")
}
