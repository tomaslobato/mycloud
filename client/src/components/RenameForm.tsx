import { XIcon } from "lucide-react"
import React from "react"

type Props = {
    editing: { mode: "rename" | "create", type: "file" | "dir", input: string } | null
    setEditing: React.Dispatch<React.SetStateAction<{ mode: "rename" | "create", type: "file" | "dir", input: string } | null>>
    handleRename: (ev: React.FormEvent) => void
    closeForm: (ev: React.MouseEvent<HTMLButtonElement>) => void
}

export default function RenameForm({ editing, setEditing, handleRename, closeForm }: Props) {
    if (!editing) return null

    return (
        <form onSubmit={handleRename} className="explorer-form">
            <button onClick={closeForm}><XIcon size={24} /></button>
            <input
                type="text"
                onChange={(ev) => setEditing({ ...editing!, input: ev.target.value })}
                value={editing?.input}
                onClick={ev => { ev.preventDefault(); ev.stopPropagation() }}
                autoFocus
            />
            <button type="submit">
                Rename
            </button>
        </form>
    )
}