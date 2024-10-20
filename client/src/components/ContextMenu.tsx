import { DownloadIcon, FilePlusIcon, FolderPlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react"
import { FileItem } from "./Explorer"
import React from "react"

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
    setForm: (type: "file" | "dir", mode: "rename" | "create") => void
    handleDelete: () => void
}

export default function ContextMenu({ contextMenu, setContextMenu, setForm, handleDelete }: ContextMenuProps) {
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


    return (
        <div
            style={{ position: 'absolute', left: contextMenu.x, top: contextMenu.y }}
            className='context-menu'
            onClick={() => {
            }}
            onContextMenu={(ev) => ev.preventDefault()}
        >
            <ul>
                {contextMenu?.isDir ? <li onClick={() => setForm("file", "create")}><FilePlusIcon />New File</li> : null}
                {contextMenu?.isDir ? <li onClick={() => setForm("dir", "create")}><FolderPlusIcon />New Folder</li> : null}
                {!contextMenu?.isDir ? <li onClick={handleDownload}><DownloadIcon />Download</li> : null}
                <li onClick={() => setForm(contextMenu.isDir ? "dir" : "file", "rename")}><SquarePenIcon />Rename</li>
                <li onClick={handleDelete}><Trash2Icon /> Delete</li>
            </ul>
        </div>
    )
}