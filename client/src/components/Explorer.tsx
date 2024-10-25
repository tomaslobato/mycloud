import React, { Fragment, SetStateAction, useEffect, useState } from "react"
import { create, move, remove, rename } from "../actions.ts"
import ContextMenu from "./ContextMenu"
import CreateForm from "./CreateForm.tsx"
import FileComponent from "./FileComponent.tsx"
import { FilePlusIcon, FolderPlusIcon, Loader2 } from "lucide-react"
import Dropzone from "./Dropzone.tsx"

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
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [editing, setEditing] = useState<{ mode: "create" | "rename", type: "file" | "dir", input: string } | null>(null)
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


    function isDir(id: string) {
        const file = files?.find(file => file.id === id)
        if (file?.isDir) return true
        else return false
    }


    //KEYS
    useEffect(() => {
        const handleOutsideClick = () => {
            if (contextMenu) {
                setContextMenu(null)
            }
        }

        const handleEscapeKey = async (ev: KeyboardEvent) => {
            if (ev.key === "Escape" && contextMenu) {
                setContextMenu(null)
            }
            if (ev.key === "Escape" && selectedFiles) {
                setEditing(null)
            }
            if (ev.key === "Del" && selectedFiles[0]) {
                remove(selectedFiles[0])
            }
            if (ev.key === "Enter" && editing) {
                if (!selectedFiles[0]) {
                    await create("", editing.type === "dir", editing.input)
                }
                if (editing.mode === "rename") {
                    await rename(selectedFiles[0], editing.input)
                } else if (editing.mode === "create") {
                    await create(selectedFiles[0], editing.type === "dir", editing.input)
                }

                setSelectedFiles([])
                setEditing(null)
                handleGetFiles()
            }
            if (ev.key === "F2") {
                console.log("hit f2")
                if (selectedFiles[0]) {
                    setForm(isDir(selectedFiles[0]) ? "dir" : "file", "rename")
                }
            }
        }

        document.addEventListener('click', handleOutsideClick)
        document.addEventListener('keydown', handleEscapeKey)

        return () => {
            document.removeEventListener('click', handleOutsideClick)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [contextMenu, selectedFiles, editing, editing?.input])



    //CONTEXT MENU
    function handleContextMenu(ev: React.MouseEvent<HTMLLIElement | HTMLButtonElement>, file: FileItem) {
        ev.preventDefault()
        ev.stopPropagation()
        setSelectedFiles([file.id])
        const menuWidth = 120 // Adjust based on your context menu width
        const newX = ev.clientX - menuWidth < 0 ? 0 : ev.clientX - menuWidth // Adjust the x position to the left
        setContextMenu({
            x: newX,
            y: ev.clientY,
            file,
            isDir: file.isDir
        })
    }

    function setForm(type: "file" | "dir", mode: "rename" | "create") {
        if (mode === "create") {
            setEditing({ mode, type, input: "" })
        } else if (mode === "rename" && selectedFiles[0]) {
            const file = files?.find(file => file.id === selectedFiles[0])
            setEditing({ mode, type, input: file?.name || "" })
        }
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

        if (lastSlashIndex === -1) return true //root level file

        const parentId = id.substring(0, lastSlashIndex)
        const parent = files?.find((file) => parentId === file.id) //parent     

        return parent?.isOpen ? isParentOpen(parent.id) : false  //check parent dirs recursively
    }

    if (loading) {
        return <div className="errscreen">
            <Loader2 className="loader" size={80} />
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

    async function handleDelete() {
        const id = contextMenu?.file?.id
        if (!id) {
            return
        }
        try {
            await remove(id)
            setContextMenu(null)
            handleGetFiles()
        } catch (error) {
            console.error("Failed to delete file:", error)
        }
    }

    return (
        <>
            <ul className="explorer" onDrop={(ev) => handleDrop(ev, "")} onDragOver={handleDragOver} onClick={() => setSelectedFiles([])}>
                <Dropzone handleGetFiles={handleGetFiles} />

                {/* top buttons */}
                {selectedFiles.length === 0 && editing?.mode === "create" ?
                    <CreateForm selectedFileId={selectedFiles[0]} setSelectedFiles={setSelectedFiles} handleGetFiles={handleGetFiles} editing={editing} setEditing={setEditing} />
                    : (
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "8px 0" }} className="topbuttons">
                            <button onClick={() => setForm("file", "create")}>
                                <FilePlusIcon /> New file
                            </button>
                            <button onClick={() => setForm("dir", "create")}>
                                <FolderPlusIcon /> New folder
                            </button>
                        </div>
                    )
                }

                {files?.map(file => (
                    <Fragment key={file.id}>
                        {file.id.includes("/") && !isParentOpen(file.id) ? null
                            : <FileComponent
                                selectedFiles={selectedFiles}
                                setSelectedFiles={setSelectedFiles}
                                setEditorOpen={setEditorOpen}
                                handleGetFiles={handleGetFiles}
                                editing={editing}
                                setEditing={setEditing}
                                file={file}
                                files={files}
                                setFiles={setFiles}
                                handleContextMenu={handleContextMenu}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}

                            />

                        }
                    </Fragment>
                ))}
            </ul>
            {contextMenu && (
                <ContextMenu
                    setForm={setForm}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    handleDelete={handleDelete}
                />
            )}
        </>
    )
}