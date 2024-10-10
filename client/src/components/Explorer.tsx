import { ChevronDownIcon, ChevronRightIcon, EllipsisVerticalIcon, Loader2, XIcon } from "lucide-react"
import React, { Fragment, SetStateAction, useEffect, useState } from "react"
import { create, move, remove, rename, upload } from "../actions.ts"
import ContextMenu from "./ContextMenu"

type FileItem = {
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
    const [input, setInput] = useState("")

    //GET FILES
    async function getFiles() {
        try {
            const res = await fetch("/api/files")
            const json = await res.json()
            setFiles(json)
            setLoading(false)
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => { getFiles() }, [])

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


    function handleRename() {
        const id = contextMenu?.file?.id!
        if (!id) {
            return
        }
        setSelectedFile({ id, mode: "rename", isDir: null })
        setInput(contextMenu?.file?.name!)
    }

    async function handleCreateFile() {
        const id = contextMenu?.file?.id!

        setSelectedFile({ id, mode: "create", isDir: false })
        setInput("")
    }

    async function handleCreateDir() {
        const id = contextMenu?.file?.id!

        setSelectedFile({ id, mode: "create", isDir: true })
        setInput("")
    }

    function handleDownload() {
        const id = contextMenu?.file?.id!
        if (!id || contextMenu?.isDir) return

        const link = document.createElement('a')
        link.href = `/api/download/${encodeURIComponent(id)}`
        link.setAttribute('download', contextMenu?.file?.name!) // Setting the download attribute
        link.style.display = 'none' // Hide the element from the UI
        document.body.appendChild(link)

        link.click() // Trigger the download
        document.body.removeChild(link) // Clean up the DOM after download

        console.log(`Downloading file: ${contextMenu?.file?.name}`)
    }



    function renderFile(file: FileItem) {
        let slashes
        slashes = file.id.split("/").length
        if (slashes === 0) return

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
                    <>
                        {selectedFile?.id === file.id && selectedFile.mode === "rename" ? (
                            <form>
                                <button onClick={ev => {
                                    ev.preventDefault()
                                    ev.stopPropagation()
                                    setInput("")
                                    setSelectedFile(null)
                                }}><XIcon/></button>
                                <input type="text" onChange={(ev) => setInput(ev.target.value)} value={input} onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} />
                                <button onClick={(ev) => {
                                    ev.preventDefault()
                                    ev.stopPropagation()
                                    rename(selectedFile.id, input)
                                    setSelectedFile(null)
                                    setInput("")
                                    getFiles()
                                }}>
                                    Rename
                                </button>
                            </form>
                        ) : (
                            <div>
                                <div>
                                    {file.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                    <span>{file.name}</span>
                                </div>

                                <button className="ellipsis" onClick={(ev) => {
                                    ev.preventDefault()
                                    ev.stopPropagation()
                                    handleContextMenu(ev, file)
                                }} >
                                    <EllipsisVerticalIcon />
                                </button>
                            </div>
                        )
                        }
                    </>
                    {selectedFile?.mode === "create" && selectedFile.id === file.id && (
                        <form className="create-mode">
                            <button onClick={(ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                setSelectedFile(null)
                                setInput("")
                            }}>
                                <XIcon />
                            </button>
                            <input type="text" onChange={ev => setInput(ev.target.value)} value={input} onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} />
                            <button onClick={() => {
                                create(selectedFile.id, selectedFile.isDir!, input)
                                setSelectedFile(null)
                                setInput("")
                                getFiles()
                            }}>
                                Save {selectedFile.isDir ? "folder" : "file"}
                            </button>
                        </form>
                    )}
                </li >
            ) : (
                <li
                    className="file"
                    style={{ paddingLeft: slashes * 16 + "px" }}
                    draggable={!selectedFile}
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    onClick={() => setEditorOpen({ open: true, id: file.id })}
                >
                    <div>
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
                                <button className="ellipsis" onClick={(ev) => {
                                    ev.preventDefault()
                                    ev.stopPropagation()
                                    handleContextMenu(ev, file)
                                }} >
                                    <EllipsisVerticalIcon />
                                </button>
                            </>
                        )
                        }

                    </div>
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
                    onCreateFile={handleCreateFile}
                    onCreateDir={handleCreateDir}
                    onDownload={handleDownload}
                    isDir={contextMenu.isDir}
                />
            )}
        </>
    )
}