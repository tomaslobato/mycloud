import React from 'react'

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
                {isDir ? <li onClick={onCreateFile}>Create New File</li> : null}
                {isDir ? <li onClick={onCreateDir}>Create New Folder</li> : null}
                {!isDir ? <li onClick={onDownload}>Download</li> : null}
                <li onClick={onDelete}>Delete</li>
                <li onClick={onRename}>Rename</li>
            </ul>
        </div>
    )
}