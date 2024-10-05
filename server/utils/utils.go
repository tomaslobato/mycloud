package utils

import (
	"os"
	"path/filepath"

	"github.com/tomaslobato/mycloud/server/models"
)

func RecursiveSetFiles(currentDir string, ROOT string) ([]models.File, error) {
	var files []models.File

	fls, err := os.ReadDir(ROOT + "/" + currentDir)
	if err != nil {
		return nil, err
	}

	for _, f := range fls {
		var file models.File
		file.Name = f.Name()
		file.IsDir = f.IsDir()
		file.Id = filepath.Join(currentDir, file.Name)

		if file.IsDir {
			files = append(files, file)
			subFiles, err := RecursiveSetFiles(file.Id, ROOT)
			if err != nil {
				return nil, err
			}
			files = append(files, subFiles...)
		} else {
			files = append(files, file)
		}
	}

	return files, nil
}
