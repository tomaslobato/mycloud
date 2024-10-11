import { XIcon } from "lucide-react"
import { create } from "../actions"

type Props = {
    selectedFile: { id: string; mode: "create" | "rename", isDir: null | boolean } | null
    setSelectedFile: React.Dispatch<React.SetStateAction<{
        id: string
        mode: "create" | "rename"
        isDir: null | boolean
    } | null>>
    input: string
    setInput: React.Dispatch<React.SetStateAction<string>>
    handleGetFiles: () => void
}

export default function CreateForm({ selectedFile, setSelectedFile, setInput, input, handleGetFiles }: Props) {
    return (
        <form className="create-mode">
            {selectedFile ? (
                <>
                    <button onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        setSelectedFile(null)
                        setInput("")
                    }}>
                        <XIcon />
                    </button>
                    <input 
                    type="text" 
                    onChange={ev => setInput(ev.target.value)} 
                    value={input} 
                    onClick={ev => { ev.preventDefault(); ev.stopPropagation() }} 
                    placeholder={`new ${selectedFile.isDir ? "folder" : "file"} at ${selectedFile.id}`} />
                    <button onClick={() => {
                        create(selectedFile.id, selectedFile.isDir!, input)
                        setSelectedFile(null)
                        setInput("")
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