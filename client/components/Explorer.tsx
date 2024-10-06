import { ChevronDown, ChevronLeft, ChevronRight, EllipsisVertical, Loader2 } from "lucide-react"
import React, { Fragment, useEffect, useState } from "react"
import { move, remove, rename, upload } from "../actions"
import ContextMenu from "./ContextMenu"

export type File = {
    isDir: boolean
    name: string
    id: string
    isOpen: boolean
}

export default function Explorer() {
    const [files, setFiles] = useState<File[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: File | null, isDir: boolean } | null>(null)
    const [selectedFile, setSelectedFile] = useState<{ id: string; mode: "create" | "rename" } | null>(null)
    const [input, setInput] = useState("")

    //GET FILES
    async function getFiles() {
        const res = await fetch("/api/files")
        const json = await res.json()
        setFiles(json)
        setLoading(false)
    }

    useEffect(() => { getFiles() }, [])

    //KEYS
    useEffect(() => {
        const handleOutsideClick = (ev: MouseEvent) => {
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
                rename(selectedFile.id, input)
                    .then(() => {
                        setSelectedFile(null)
                        setInput("")
                        getFiles()
                    })
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

    function toggleDir(id: string) {
        if (!files) return
        const i = files?.findIndex(file => file.id === id)
        const newFiles = [...files]
        newFiles[i].isOpen = !files[i].isOpen
        setFiles(newFiles)
    }

    function isParentOpen(id: string): boolean {
        const lastSlashIndex = id.lastIndexOf("/")

        if (lastSlashIndex === -1) return true //it's a root level file

        const parentId = id.substring(0, lastSlashIndex)
        const parent = files?.find((file) => parentId === file.id) //get parent     

        return parent?.isOpen ? isParentOpen(parent.id) : false  //check parent dirs recursively
    }

    //DRAG AND DROP (MOVE)
    function handleDragStart(ev: React.DragEvent<HTMLLIElement>, fileId: string) {
        ev.dataTransfer.setData("text/plain", fileId)
    }

    function handleDrop(ev: React.DragEvent<HTMLLIElement | HTMLUListElement>, newDirId: string) {
        ev.preventDefault()
        const fileId = ev.dataTransfer.getData("text")

        if (!files) return

        const name = fileId.split("/").pop()!

        if (newDirId === "") {
            move(fileId, name)
        }

        move(fileId, newDirId + "/" + name)

        getFiles()
    }

    function handleDragOver(ev: React.DragEvent<HTMLLIElement | HTMLUListElement>) {
        ev.preventDefault() // Required to allow dropping
    }



    //CONTEXT MENU
    function handleContextMenu(ev: React.MouseEvent<HTMLLIElement>, file: File) {
        ev.preventDefault()
        ev.stopPropagation()
        setContextMenu({ x: ev.clientX, y: ev.clientY, file, isDir: file.isDir })
    }


    function handleRename() {
        const id = contextMenu?.file?.id!
        if (!id) {
            return
        }
        setSelectedFile({ id, mode: "rename" })
        setInput(contextMenu?.file?.name!)
    }

    async function handleCreate() {
    }


    function renderFile(file: File) {
        let slashes
        if (file.id.includes("/")) {
            slashes = file.id.split("/").length
        }

        return <>
            {file.isDir ? (
                <li key={file.id}
                    className="dir"
                    onClick={() => toggleDir(file.id)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    style={{ paddingLeft: slashes * 16 + "px" }}
                    draggable={!selectedFile}
                    onDrop={(ev) => handleDrop(ev, file.id)}
                    onDragOver={handleDragOver}
                    onDragStart={(e) => handleDragStart(e, file.id)}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {file.isOpen ? <ChevronDown /> : <ChevronRight />}
                        {selectedFile?.id === file.id && selectedFile.mode === "rename" ? (
                            <>
                                <input type="text" onChange={(ev) => setInput(ev.target.value)} value={input} onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} />
                                <button onClick={() => {
                                    rename(selectedFile.id, input)
                                    setSelectedFile(null)
                                    setInput("")
                                    getFiles()
                                }}>
                                    Rename
                                </button>
                            </>
                        ) : (
                            <span>{file.name}</span>
                        )
                        }
                    </div>
                    <button onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setContextMenu({ x: ev.clientX, y: ev.clientY, file, isDir: file.isDir })
                    }} >
                        <EllipsisVertical />
                    </button>
                </li >
            ) : (
                <li
                    className="file"
                    style={{ paddingLeft: slashes * 16 + "px" }}
                    draggable={!selectedFile}
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                >
                    {selectedFile?.id === file.id && selectedFile.mode === "rename" ? (
                        <>
                            <input type="text" onChange={(ev) => setInput(ev.target.value)} value={input} onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} />
                            <button onClick={() => {
                                rename(selectedFile.id, input)
                                setSelectedFile(null)
                                setInput("")
                                getFiles()
                            }}>
                                Rename
                            </button>
                        </>
                    ) : (
                        <>
                            <span>{file.name}</span>
                            <button onClick={(ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                setContextMenu({ x: ev.clientX, y: ev.clientY, file, isDir: file.isDir })
                            }} >
                                <EllipsisVertical />
                            </button>
                        </>
                    )
                    }
                </li>
            )
            }
        </>
    }

    if (loading) {
        return <Loader2 />
    }

    return (
        <>
            <ul className="explorer" onDrop={(ev) => handleDrop(ev, "")} onDragOver={handleDragOver}>
                <label htmlFor="fileinput" className="fileinput">Click or drop your files here</label>
                <input type="file" multiple onChange={(ev) => { upload(ev); getFiles() }} hidden id="fileinput" />
                {files?.map(file => (
                    <Fragment key={file.id}>
                        {file.id.includes("/") && !isParentOpen(file.id) ? null : renderFile(file)}
                    </Fragment>
                ))}
            </ul>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onDelete={() => { remove(contextMenu?.file?.id!); getFiles() }}
                    onRename={handleRename}
                    onCreate={() => { }}
                    isDir={contextMenu.isDir}
                />
            )}
        </>
    )
}