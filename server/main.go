package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/tomaslobato/mycloud/handlers"
)

func main() {

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

	app.Listen(":5000")
}
