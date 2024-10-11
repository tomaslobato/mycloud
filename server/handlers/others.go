package handlers

import (
	"net/url"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

type MoveReq struct {
	OldId string `json:"oldId"`
	NewId string `json:"newId"`
}

func Delete(c *fiber.Ctx) error {
	encodedId := c.Params("id")

	id, err := url.QueryUnescape(encodedId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	path := filepath.Join(os.Getenv("ROOT"), id)
	fileInfo, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return c.Status(404).JSON(fiber.Map{"error": "file or dir not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to get file info"})
	}

	if fileInfo.IsDir() {
		err = os.RemoveAll(path)
	} else {
		err = os.Remove(path)
	}
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to remove file or dir"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func Move(c *fiber.Ctx) error {
	ROOT := os.Getenv("ROOT")

	var req MoveReq
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	from := filepath.Join(ROOT, req.OldId)
	to := filepath.Join(ROOT, req.NewId)

	err = os.Rename(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to move the file",
		})
	}

	return c.JSON(fiber.Map{"success": true})
}

func SaveContent(c *fiber.Ctx) error {
	encodedId := c.Params("id")
	id, err := url.QueryUnescape(encodedId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid file ID"})
	}

	path := filepath.Join(os.Getenv("ROOT"), id)

	if c.Get("Content-Type") != "text/plain" {
		return c.Status(415).JSON(fiber.Map{"error": "Content-Type must be text/plain"})
	}

	file, err := os.Create(path)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to access file"})
	}
	defer file.Close()

	newContent := c.Body()

	_, err = file.WriteString(string(newContent))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to write file"})
	}

	return c.JSON(fiber.Map{"success": "file written"})
}
