import { DownloadIcon, FilePlusIcon, FolderPlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react"
import { FileItem } from "./Explorer"
import React from "react"
import { remove } from "../actions"

type ContextMenuProps = {
    contextMenu: {
        x: number
        y: number
        file: FileItem | null
        isDir: boolean
    }
    setContextMenu: React.Dispatch<React.SetStateAction<{
        x: number
        y: number
        file: FileItem | null
        isDir: boolean
    }
        | null>>
    setSelectedFile: React.Dispatch<React.SetStateAction<{
        id: string
        mode: "create" | "rename"
        isDir: null | boolean
    } | null>>
    setInput: React.Dispatch<React.SetStateAction<string>>
    onCreate: (type: "file" | "folder") => void
    handleGetFiles: () => void
}

export default function ContextMenu({ contextMenu, setContextMenu, setSelectedFile, setInput, onCreate, handleGetFiles }: ContextMenuProps) {
    function handleDownload() {
        const id = contextMenu?.file?.id!
        if (!id || contextMenu?.isDir) return

        const link = document.createElement('a')
        link.href = `/api/download/${encodeURIComponent(id)}`
        link.setAttribute('download', contextMenu?.file?.name!)
        link.style.display = 'none'
        document.body.appendChild(link)

        link.click()
        document.body.removeChild(link)
        setContextMenu(null)
    }

    function handleRename() {
        const id = contextMenu?.file?.id
        if (!id) {
            return
        }
        setSelectedFile({ id, mode: "rename", isDir: contextMenu.file?.isDir! })
        setInput(contextMenu?.file?.name || "")
        setContextMenu(null)
    }

    async function handleDelete() {
        if (!contextMenu?.file?.id) {
            return
        }
        try {
            await remove(contextMenu.file.id)
            setContextMenu(null)
            await handleGetFiles()
        } catch (error) {
            console.error("Failed to delete file:", error)
        }
    }


    return (
        <div
            style={{ position: 'absolute', left: contextMenu.x, top: contextMenu.y }}
            className='context-menu'
            onClick={() => {
            }}
            onContextMenu={(ev) => ev.preventDefault()}
        >
            <ul>
                {contextMenu?.isDir ? <li onClick={() => onCreate("file")}><FilePlusIcon />New File</li> : null}
                {contextMenu?.isDir ? <li onClick={() => onCreate("folder")}><FolderPlusIcon />New Folder</li> : null}
                {!contextMenu?.isDir ? <li onClick={handleDownload}><DownloadIcon />Download</li> : null}
                <li onClick={handleRename}><SquarePenIcon />Rename</li>
                <li onClick={handleDelete}><Trash2Icon /> Delete</li>
            </ul>
        </div>
    )
}