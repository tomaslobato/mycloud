package handlers

import (
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

	err = os.Rename(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to move the file",
		})
	}

	return c.JSON(fiber.Map{"success": true})
}

// check later
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
