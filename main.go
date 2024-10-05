package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/tomaslobato/mycloud/server/handlers"
)

func HandleFrontRoutes(app *fiber.App, routes []string) {
	app.Static("/", "./dist", fiber.Static{
		CacheDuration: 200,
	})

	for _, r := range routes {
		app.Get(r, func(c *fiber.Ctx) error {
			return c.SendFile("./dist/index.html")
		})
	}
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()

	frontRoutes := []string{
		"/",
		"/explorer",
	}

	HandleFrontRoutes(app, frontRoutes)

	app.Get("/api/files", handlers.Get)

	app.Put("/api/move", handlers.Move)

	app.Post("/api/upload", handlers.Upload)

	app.Listen(":5000")
}
