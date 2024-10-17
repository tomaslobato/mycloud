import { ChevronDownIcon, ChevronRightIcon, EllipsisVerticalIcon, XIcon } from "lucide-react"
import { FileItem } from "./Explorer"
import { rename } from "../actions"
import React from "react"
import CreateForm from "./CreateForm"
import ProperIcon from "./ProperIcon"

type Props = {
    file: FileItem,
    files: FileItem[] | null,
    setFiles: React.Dispatch<React.SetStateAction<FileItem[] | null>>
    handleContextMenu: (ev: React.MouseEvent<HTMLLIElement | HTMLButtonElement>, file: FileItem) => void
    selectedFile: { id: string; mode: "create" | "rename", isDir: null | boolean } | null
    setSelectedFile: React.Dispatch<React.SetStateAction<{
        id: string
        mode: "create" | "rename"
        isDir: null | boolean
    } | null>>
    input: string
    setInput: React.Dispatch<React.SetStateAction<string>>
    handleGetFiles: () => void
    setEditorOpen: React.Dispatch<React.SetStateAction<{ open: boolean; id: string } | null>>
    handleDragOver: (ev: React.DragEvent<HTMLLIElement | HTMLUListElement>) => void
    handleDrop: (ev: React.DragEvent<HTMLLIElement | HTMLUListElement>, newDirId: string) => void
    handleDragStart: (ev: React.DragEvent<HTMLLIElement>, fileId: string) => void
}

export default function FileComponent(
    { files, setFiles, file, handleContextMenu, selectedFile, setSelectedFile, input, setInput, handleGetFiles, setEditorOpen, handleDrop, handleDragOver, handleDragStart }: Props
) {

    function toggleDir(id: string) {
        if (!files) return
        const i = files?.findIndex(file => file.id === id)
        const newFiles = [...files]
        newFiles[i].isOpen = !files[i].isOpen
        setFiles(newFiles)
    }

    function getLevel() {
        let slashes
        slashes = file.id.split("/").length
        if (slashes === 0) return 0

        return slashes
    }

    function handleRename(ev: React.FormEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        rename(selectedFile!.id, input)
        setSelectedFile(null)
        setInput("")
        handleGetFiles()
    }


    const isRenaming = selectedFile?.id === file.id && selectedFile.mode === "rename"

    return <>
        {file.isDir ? (
            <li key={file.id}
                className="dir"
                onClick={() => toggleDir(file.id)}
                onContextMenu={(ev) => handleContextMenu(ev, file)}
                style={{ paddingLeft: getLevel() * 16 + "px", background: selectedFile?.id === file.id ? "#1a1a1a" : "" }}
                draggable={!selectedFile}
                onDrop={(ev) => handleDrop(ev, file.id)}
                onDragOver={handleDragOver}
                onDragStart={(e) => handleDragStart(e, file.id)}
            >
                <>
                    {isRenaming ? (
                        <form>
                            <button onClick={ev => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                setInput("")
                                setSelectedFile(null)
                            }}><XIcon /></button>
                            <input type="text" onChange={(ev) => setInput(ev.target.value)} value={input} onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} />
                            <button onClick={handleRename}>
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
                    <CreateForm selectedFile={selectedFile} handleGetFiles={handleGetFiles} setSelectedFile={setSelectedFile} input={input} setInput={setInput} />
                )}
            </li >
        ) : (
            <li
                className="file"
                style={{ paddingLeft: getLevel() * 16 + "px", background: selectedFile?.id === file.id ? "#1a1a1a" : "" }}
                draggable={!selectedFile}
                onDragStart={(e) => handleDragStart(e, file.id)}
                onContextMenu={(e) => handleContextMenu(e, file)}
                onClick={() => setEditorOpen({ open: true, id: file.id })}
            >
                <>
                    {selectedFile?.id === file.id && selectedFile.mode === "rename" ? (
                        <form onSubmit={(ev) => {
                            ev.preventDefault()
                            ev.stopPropagation()
                            rename(selectedFile.id, input)
                            setSelectedFile(null)
                            setInput("")
                            handleGetFiles()
                        }}>
                            <button type="button" onClick={(ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                setInput("")
                                setSelectedFile(null)
                                handleGetFiles()    
                            }}>
                                <XIcon />
                            </button>
                            <input
                                type="text"
                                onChange={(ev) => setInput(ev.target.value)}
                                value={input}
                                onClick={(ev) => { ev.preventDefault(); ev.stopPropagation() }}
                                autoFocus
                            />
                            <button type="submit">Rename</button>
                        </form>
                    ) : (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <ProperIcon name={file.name} />
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
            </li>
        )
        }
    </>
}