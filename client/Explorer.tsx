import { EllipsisVertical, Loader2 } from "lucide-react"
import React, { Fragment, useEffect, useState } from "react"
import { move } from "./actions"

export type File = {
    isDir: boolean
    name: string
    id: string
    isOpen: boolean
}

export default function Explorer() {
    const [files, setFiles] = useState<File[] | null>(null)
    const [loading, setLoading] = useState(true)

    //GET FILES
    async function getFiles() {
        const res = await fetch("/api/files")
        const json = await res.json()
        setFiles(json)
        setLoading(false)
    }

    useEffect(() => { getFiles() }, [])

    function toggleDir(id: string) {
        if (!files) return
        const i = files?.findIndex(file => file.id === id)
        const newFiles = [...files]
        newFiles[i].isOpen = !files[i].isOpen
        console.log("toggled:", id)
        setFiles(newFiles)
    }

    function isParentOpen(id: string): boolean {
        const lastSlashIndex = id.lastIndexOf("/")

        if (lastSlashIndex === -1) return true //it's a root level file

        const parentId = id.substring(0, lastSlashIndex)
        const parent = files?.find((file) => parentId === file.id) //get parent     

        return parent?.isOpen ? isParentOpen(parent.id) : false  //check parent dirs recursively
    }






    //UPLOAD
    async function handleUploadFiles(ev: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = ev.target.files

        // Ensure that files are selected
        if (!selectedFiles || selectedFiles.length === 0) return

        const formData = new FormData()

        // Use a correct loop initialization
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append("files", selectedFiles[i]) // Append each file to the formData
        }

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })

        if (!res.ok) {
            console.error('Upload failed:', res.statusText)
            return
        }

        const json = await res.json()
        console.log(json)

        // Clear the input field
        ev.target.value = "" // Clear the input field by setting its value to an empty string
        getFiles()
    }



    //DRAG AND DROP (MOVE)
    // Handle drag event for files
    function handleDragStart(event: React.DragEvent<HTMLLIElement>, fileId: string) {
        event.dataTransfer.setData("text/plain", fileId)
    }

    // Handle drop event on directories
    function handleDrop(event: React.DragEvent<HTMLLIElement | HTMLUListElement>, newDirId: string) {
        event.preventDefault()
        const fileId = event.dataTransfer.getData("text")

        if (!files) return

        const name = fileId.split("/").pop()!

        if (newDirId === "") {
            move(fileId, name)
        }

        move(fileId, newDirId + "/" + name)

        getFiles()
    }

    function handleDragOver(event: React.DragEvent<HTMLLIElement | HTMLUListElement>) {
        event.preventDefault() // Required to allow dropping
    }




    function renderFile(file: File) {
        let slashes
        if (file.id.includes("/")) {
            slashes = file.id.split("/").length
        }

        return <>
            {file.isDir ? (
                <li key={file.id}
                    onClick={() => toggleDir(file.id)}
                    style={{ paddingLeft: slashes * 16 + "px" }}
                    draggable
                    onDrop={(ev) => handleDrop(ev, file.id)}
                    onDragOver={handleDragOver}
                    onDragStart={(e) => handleDragStart(e, file.id)}
                >
                    {file.isOpen ? "📂" : "📁"}{file.name}
                </li>
            ) : (
                <li
                    style={{ paddingLeft: slashes * 16 + "px" }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                >
                    📃{file.name}
                </li>
            )}
        </>
    }

    if (loading) {
        return <Loader2 />
    }

    return (
        <ul className="explorer" onDrop={(ev) => handleDrop(ev, "")} onDragOver={handleDragOver}>
            <input type="file" multiple onChange={handleUploadFiles} />
            {files?.map(file => (
                <Fragment key={file.id}>
                    {file.id.includes("/") && !isParentOpen(file.id) ? null : renderFile(file)}
                </Fragment>
            ))}
        </ul>
    )
}