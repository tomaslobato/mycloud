import { ChevronDownIcon, ChevronRightIcon, EllipsisVerticalIcon } from "lucide-react"
import { FileItem } from "./Explorer"
import { rename } from "../actions"
import React from "react"
import CreateForm from "./CreateForm"
import ProperIcon from "./ProperIcon"
import RenameForm from "./RenameForm"

type Props = {
    file: FileItem,
    files: FileItem[] | null,
    setFiles: React.Dispatch<React.SetStateAction<FileItem[] | null>>
    handleContextMenu: (ev: React.MouseEvent<HTMLLIElement | HTMLButtonElement>, file: FileItem) => void
    handleGetFiles: () => void
    setEditorOpen: React.Dispatch<React.SetStateAction<{ open: boolean; id: string } | null>>
    handleDragOver: (ev: React.DragEvent<HTMLLIElement | HTMLUListElement>) => void
    handleDrop: (ev: React.DragEvent<HTMLLIElement | HTMLUListElement>, newDirId: string) => void
    handleDragStart: (ev: React.DragEvent<HTMLLIElement>, fileId: string) => void
    selectedFiles: string[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>
    editing: { mode: "create" | "rename", type: "file" | "dir", input: string } | null
    setEditing: React.Dispatch<React.SetStateAction<{
        mode: "create" | "rename"
        type: "file" | "dir"
        input: string
    } | null>>
}

export default function FileComponent(
    { files, setFiles, file, handleContextMenu, handleGetFiles, setEditorOpen, handleDrop, handleDragOver, handleDragStart, selectedFiles, setSelectedFiles, editing, setEditing }: Props
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
        if (!selectedFiles || !editing) return

        rename(selectedFiles[0], editing.input)
        setSelectedFiles([])
        setEditing(null)
        handleGetFiles()
    }

    function closeForm(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.preventDefault()
        ev.stopPropagation()
        setSelectedFiles([])
        setEditing(null)
    }

    function openFile() {
        setEditorOpen({ open: true, id: file.id })
        setSelectedFiles([file.id])
    }

    function isSelected(id: string) {
        if (selectedFiles?.includes(id)) {
            return true
        } else return false
    }

    const isRenaming = selectedFiles?.[0] === file.id && editing?.mode === "rename"

    const Dir = () => (
        <li key={file.id}
            className="dir"
            onClick={() => toggleDir(file.id)}
            onContextMenu={(ev) => handleContextMenu(ev, file)}
            style={{ paddingLeft: getLevel() * 16 + "px", background: selectedFiles![0] === file.id ? "#1a1a1a" : "" }}
            draggable={!selectedFiles}
            onDrop={(ev) => handleDrop(ev, file.id)}
            onDragOver={handleDragOver}
            onDragStart={(e) => handleDragStart(e, file.id)}
        >
            <>
                {isRenaming ? (
                    <RenameForm closeForm={closeForm} setEditing={setEditing} editing={editing} handleRename={handleRename} />
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
            {editing?.mode === "create" && selectedFiles && selectedFiles[0] === file.id && (
                <CreateForm selectedFileId={selectedFiles[0]} handleGetFiles={handleGetFiles} setSelectedFiles={setSelectedFiles} editing={editing} setEditing={setEditing} />
            )}
        </li >
    )

    const File = () => (
        <li
            className={`file ${isSelected(file.id) ? "selected" : ""}`}
            style={{ paddingLeft: getLevel() * 16 + "px" }}
            draggable={!selectedFiles}
            onDragStart={(e) => handleDragStart(e, file.id)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            onClick={openFile}
        >
            <>
                {selectedFiles && selectedFiles[0] === file.id && editing?.mode === "rename" ? (
                    <RenameForm closeForm={closeForm} setEditing={setEditing} editing={editing} handleRename={handleRename} />
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

    return <>
        {file.isDir ? <Dir /> : <File />}
    </>
}