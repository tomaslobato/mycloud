package handlers

import (
	"net/url"
	"os"
	"path/filepath"
	"strings"

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
	ext := strings.ToLower(filepath.Ext(path))
	var contentType string

	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".webp":
		contentType = "image/webp"
	case ".svg":
		contentType = "image/svg+xml"
	case ".csv":
		contentType = "text/csv"
	case ".md":
		contentType = "text/markdown"
	case ".txt":
		contentType = "text/plain"
	case ".pdf":
		contentType = "application/pdf"
	case ".mp4":
		contentType = "video/mp4"
	case ".mkv":
		contentType = "video/x-matroska"
	default:
		// Let the browser figure it out
		contentType = "application/octet-stream"
	}

	c.Set("Content-Type", contentType)
	return c.SendFile(path)
}
