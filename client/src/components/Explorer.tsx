import React, { Fragment, SetStateAction, useEffect, useState } from "react"
import { create, move, rename, upload } from "../actions.ts"
import ContextMenu from "./ContextMenu"
import CreateForm from "./CreateForm.tsx"
import FileComponent from "./FileComponent.tsx"
import { FilePlusIcon, FolderPlusIcon, Loader2 } from "lucide-react"

export type FileItem = {
    isDir: boolean
    id: string
    name: string
    isOpen: boolean
}

type Props = {
    setEditorOpen: React.Dispatch<SetStateAction<{ open: boolean, id: string } | null>>
}

export default function Explorer({ setEditorOpen }: Props) {
    const [files, setFiles] = useState<FileItem[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem | null, isDir: boolean } | null>(null)
    const [selectedFile, setSelectedFile] = useState<{ id: string; mode: "create" | "rename", isDir: null | boolean } | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null)
    const [input, setInput] = useState("")
    const [error, setError] = useState("")

    async function handleGetFiles() {
        try {
            setError("")
            setLoading(true)
            const res = await fetch("/api/files")
            if (!res.ok) throw new Error()
            const json = await res.json()
            setFiles(json)
            setLoading(false)
        } catch (err) {
            setLoading(false)
            console.error(err)
            setError("The selected directory doesn't exist")
        }
    }

    useEffect(() => {
        handleGetFiles()
    }, [])


    //KEYS
    useEffect(() => {
        const handleOutsideClick = () => {
            if (contextMenu) {
                setContextMenu(null)
            }
        }

        const handleEscapeKey = (ev: KeyboardEvent) => {
            if (ev.key === "Escape" && contextMenu) {
                setContextMenu(null)
            }
            if (ev.key === "Escape" && selectedFile) {
                setSelectedFile(null)
                setInput("")
            }
            if (ev.key === "Enter" && selectedFile) {
                if (selectedFile.mode === "rename") {
                    rename(selectedFile.id, input)
                } else {
                    create(selectedFile.id, selectedFile.isDir!, input)
                }

                setSelectedFile(null)
                setInput("")
                handleGetFiles()
            }
        }

        // Add event listener for clicks
        document.addEventListener('click', handleOutsideClick)
        document.addEventListener('keydown', handleEscapeKey)

        // Cleanup event listener
        return () => {
            document.removeEventListener('click', handleOutsideClick)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [contextMenu, selectedFile, input])



    //CONTEXT MENU
    function handleContextMenu(ev: React.MouseEvent<HTMLLIElement | HTMLButtonElement>, file: FileItem) {
        ev.preventDefault()
        ev.stopPropagation()
        const menuWidth = 150 // Adjust based on your context menu width
        const newX = ev.clientX - menuWidth < 0 ? 0 : ev.clientX - menuWidth // Adjust the x position to the left
        setContextMenu({
            x: newX,
            y: ev.clientY,
            file,
            isDir: file.isDir
        })
    }

    function setCreate(type: "file" | "folder") {
        let id = ""

        if (contextMenu !== null) {
            id = contextMenu?.file?.id!
        }

        setSelectedFile({ id, mode: "create", isDir: type === "file" ? false : true })
        setInput("")
    }


    //DRAG AND DROP
    function handleDrop(ev: React.DragEvent<HTMLLIElement | HTMLUListElement>, newDirId: string) {
        ev.preventDefault()
        const fileId = ev.dataTransfer.getData("text")

        if (!files) return

        const name = fileId.split("/").pop()!

        if (newDirId === "") {
            move(fileId, name)
        }

        move(fileId, newDirId + "/" + name)

        handleGetFiles()
    }

    function handleDragOver(ev: React.DragEvent<HTMLLIElement | HTMLUListElement>) {
        ev.preventDefault()
    }

    function handleDragStart(ev: React.DragEvent<HTMLLIElement>, fileId: string) {
        ev.dataTransfer.setData("text/plain", fileId)
    }

    //
    function isParentOpen(id: string): boolean {
        const lastSlashIndex = id.lastIndexOf("/")

        if (lastSlashIndex === -1) return true //it's a root level file

        const parentId = id.substring(0, lastSlashIndex)
        const parent = files?.find((file) => parentId === file.id) //get parent     

        return parent?.isOpen ? isParentOpen(parent.id) : false  //check parent dirs recursively
    }

    if (loading) {
        return <div className="errscreen">
            <Loader2 className="loader" style={{ width: "80px", height: "80px" }} />
        </div>
    }

    if (error != "") {
        return (
            <div className="errscreen">
                <h1>{error}</h1>
                <button onClick={handleGetFiles}>Retry</button>
            </div>
        )
    }

    return (
        <>
            <ul className="explorer" onDrop={(ev) => handleDrop(ev, "")} onDragOver={handleDragOver}>
                <label htmlFor="fileinput" className="fileinput">Click or drop your files here</label>
                <input type="file" multiple onChange={(ev) => { upload(ev); handleGetFiles() }} hidden id="fileinput" />

                {selectedFile?.id === "" && selectedFile.mode === "create" ?
                    <CreateForm selectedFile={selectedFile} setSelectedFile={setSelectedFile} setInput={setInput} input={input} handleGetFiles={handleGetFiles} />
                    : <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "8px 0" }} className="topbuttons">
                        <button onClick={() => setCreate("file")} style={{ fontSize: "18px", display: "flex", gap: "4px" }}>
                            <FilePlusIcon /> New file
                        </button>
                        <button onClick={() => setCreate("folder")} style={{ fontSize: "18px", display: "flex", gap: "4px" }}>
                            <FolderPlusIcon /> New folder
                        </button>
                    </div>
                }

                {files?.map(file => (
                    <Fragment key={file.id}>
                        {file.id.includes("/") && !isParentOpen(file.id) ? null
                            : <FileComponent
                                selectedFiles={selectedFiles}
                                setSelectedFiles={setSelectedFiles}
                                setEditorOpen={setEditorOpen}
                                handleGetFiles={handleGetFiles}
                                input={input}
                                setInput={setInput}
                                file={file}
                                files={files}
                                setFiles={setFiles}
                                handleContextMenu={handleContextMenu}
                                selectedFile={selectedFile}
                                setSelectedFile={setSelectedFile}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop} />}
                    </Fragment>
                ))}
            </ul>
            {contextMenu && (
                <ContextMenu
                    onCreate={setCreate}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    setSelectedFile={setSelectedFile}
                    setInput={setInput}
                    handleGetFiles={handleGetFiles}
                />
            )}
        </>
    )
}