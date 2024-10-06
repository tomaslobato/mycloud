package handlers

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/tomaslobato/mycloud/server/utils"
)

type MoveReq struct {
	OldId string `json:"oldId"`
	NewId string `json:"newId"`
}

type CreateReq struct {
	Id    string `json:"id"`
	IsDir bool   `json:"isDir"`
}

func Get(c *fiber.Ctx) error {
	files, err := utils.RecursiveSetFiles("", os.Getenv("ROOT"))
	if err != nil {
		log.Printf("Error in /api/files: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(files)
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

	fmt.Println(from, to)

	err = os.Rename(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to move the file",
		})
	}

	return c.JSON(fiber.Map{"success": true})
}

func Upload(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "failed to get files from form"})
	}

	files := form.File["files"]
	fmt.Println("Uploaded files:")

	for _, file := range files {
		// Print the file name and size for better debugging
		fmt.Printf("File Name: %s, File Size: %d\n", file.Filename, file.Size)

		// Save the file
		err := c.SaveFile(file, os.Getenv("ROOT")+"/"+file.Filename)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to save file"})
		}
	}

	return c.JSON(fiber.Map{"success": true})
}

func Delete(c *fiber.Ctx) error {
	encodedId := c.Params("id")

	id, err := url.QueryUnescape(encodedId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	err = os.Remove(os.Getenv("ROOT") + "/" + id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to remove file"})
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
