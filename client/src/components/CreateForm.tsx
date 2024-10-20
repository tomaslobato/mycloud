import { XIcon } from "lucide-react"
import { create } from "../actions"

type Props = {
    selectedFileId: string
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>
    editing: { mode: "rename" | "create", type: "file" | "dir", input: string } | null
    setEditing: React.Dispatch<React.SetStateAction<{ mode: "rename" | "create", type: "file" | "dir", input: string } | null>>
    handleGetFiles: () => void
}

export default function CreateForm({ selectedFileId, setSelectedFiles, handleGetFiles, editing, setEditing }: Props) {
    return (
        <form className="explorer-form create-form">
            {editing ? (
                <>
                    <button onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setSelectedFiles([])
                        setEditing(null)
                    }}>
                        <XIcon size={24} />
                    </button>
                    <input
                        type="text"
                        onChange={ev => setEditing({ ...editing, input: ev.target.value })}
                        value={editing.input}
                        onClick={ev => { ev.preventDefault(); ev.stopPropagation() }}
                        placeholder={`new ${editing.type} at ${selectedFileId}`} 
                        autoFocus    
                    />
                    <button onClick={() => {
                        create(selectedFileId, editing.type === "dir", editing.input)
                        setSelectedFiles([])
                        setEditing(null)
                        handleGetFiles()
                    }}>
                        Save
                    </button>
                </>
            ) : (
                null
            )}
        </form>
    )
}