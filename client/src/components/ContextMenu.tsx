import { DownloadIcon, FilePlusIcon, FolderPlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react"

type ContextMenuProps = {
    x: number
    y: number
    onClose: () => void
    onDelete: () => void
    onRename: () => void
    onCreateFile: () => void
    onCreateDir: () => void
    isDir: boolean
    onDownload: () => void
}

export default function ContextMenu({ x, y, onClose, onDelete, onRename, onCreateFile, onCreateDir, isDir, onDownload }: ContextMenuProps) {
    return (
        <div
            style={{ position: 'absolute', left: x, top: y }}
            className='context-menu'
            onClick={onClose}
            onContextMenu={(e) => e.preventDefault()}
        >
            <ul>
                {isDir ? <li onClick={onCreateFile}><FilePlusIcon />New File</li> : null}
                {isDir ? <li onClick={onCreateDir}><FolderPlusIcon />New Folder</li> : null}
                {!isDir ? <li onClick={onDownload}><DownloadIcon />Download</li> : null}
                <li onClick={onRename}><SquarePenIcon />Rename</li>
                <li onClick={onDelete}><Trash2Icon /> Delete</li>
            </ul>
        </div>
    )
}