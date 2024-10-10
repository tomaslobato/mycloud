package handlers

import (
	"net/url"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/tomaslobato/mycloud/utils"
)

func HandleFrontRoutes(app *fiber.App, routes []string) {
	app.Static("/", "../client/dist", fiber.Static{
		CacheDuration: 200,
	})

	for _, r := range routes {
		app.Get(r, func(c *fiber.Ctx) error {
			return c.SendFile(filepath.Join("..", "client", "dist", "index.html"))
		})
	}
}

func GetFiles(c *fiber.Ctx) error {
	files, err := utils.RecursiveSetFiles("", os.Getenv("ROOT"))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to get files"})
	}
	return c.JSON(files)
}

func Download(c *fiber.Ctx) error {
	encodedId := c.Params("id")
	id, err := url.QueryUnescape(encodedId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid file ID"})
	}

	filePath := filepath.Join(os.Getenv("ROOT"), id)

	_, err = os.Stat(filePath)
	if os.IsNotExist(err) {
		return c.Status(404).JSON(fiber.Map{"error": "file not found"})
	}

	return c.SendFile(filePath)
}

func GetContent(c *fiber.Ctx) error {
	encodedId := c.Params("id")
	id, err := url.QueryUnescape(encodedId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid file ID"})
	}

	path := filepath.Join(os.Getenv("ROOT"), id)

	content, err := os.ReadFile(path)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed reading file"})
	}

	c.Set("Content-Type", "text/plain")
	return c.SendString(string(content))
}
