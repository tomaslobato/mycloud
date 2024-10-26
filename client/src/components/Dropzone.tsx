import { useState } from "react"
import { upload } from "../actions"
import { Loader, Loader2 } from "lucide-react"

type Props = {
    handleGetFiles: () => void
}

export default function Dropzone({ handleGetFiles }: Props) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (files: FileList) => {
        setUploading(true)
        await upload(files)
        handleGetFiles()
        setUploading(false)
    }

    return (<div
        onDrop={(ev) => {
            ev.preventDefault()
            ev.stopPropagation()
            ev.currentTarget.classList.remove('dragover')
            if (ev.dataTransfer.files.length > 0) {
                handleUpload(ev.dataTransfer.files)
            }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('dragover')
        }}
        onDragLeave={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('dragover')
        }}
    >
        <>
            <label htmlFor="fileinput"
                className="fileinput">
                    {uploading ? <Loader2 className="loader" size={32} /> : "Click or drop your files here"}
            </label>
            <input
                disabled={uploading}
                type="file"
                multiple
                onChange={(ev) => { handleUpload(ev.target.files!); ev.target.files = null }}
                hidden
                id="fileinput"
            />
        </>

    </div>
    )
}