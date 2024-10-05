package models

type File struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
	Id    string `json:"id"`
}
