package handlers

import (
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

type CreateReq struct {
	Id    string `json:"id"`
	IsDir bool   `json:"isDir"`
}

func Upload(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "failed to get files from form"})
	}

	files := form.File["files"]

	for _, file := range files {
		err := c.SaveFile(file, os.Getenv("ROOT")+"/"+file.Filename)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to save file"})
		}
	}

	return c.JSON(fiber.Map{"success": true})
}

func Create(c *fiber.Ctx) error {
	var req CreateReq
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}

	path := filepath.Join(os.Getenv("ROOT"), req.Id)

	if req.IsDir {
		err := os.Mkdir(path, os.ModePerm)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to create dir"})
		}
		return c.JSON(fiber.Map{"success": true})
	}

	newFile, err := os.Create(path)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create dir"})
	}
	defer newFile.Close()

	return c.JSON(fiber.Map{"success": true})
}
