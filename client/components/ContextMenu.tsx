import React from 'react'

type ContextMenuProps = {
    x: number
    y: number
    onClose: () => void
    onDelete: () => void
    onRename: () => void
    onCreate: () => void
    isDir: boolean
}

export default function ContextMenu({ x, y, onClose, onDelete, onRename, onCreate, isDir }: ContextMenuProps) {
    return (
        <div
            style={{ position: 'absolute', left: x, top: y }}
            className='context-menu'
            onClick={onClose}
            onContextMenu={(e) => e.preventDefault()}
        >
            <ul>
                <li onClick={onDelete}>Delete</li>
                <li onClick={onRename}>Rename</li>
                {isDir ? <li onClick={onCreate}>Create New File/Folder</li> : null}
            </ul>
        </div>
    )
}