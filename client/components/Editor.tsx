import React, { SetStateAction, useEffect, useState } from "react"
import { saveContent } from "../actions"
import { XIcon } from "lucide-react"

type Props = {
    editorOpen: {open:boolean, id:string}
    setEditorOpen: React.Dispatch<SetStateAction<{open:boolean, id:string} | null>>
}

export default function Editor({ editorOpen, setEditorOpen }: Props) {
    const [content, setContent] = useState("")

    useEffect(() => {
        async function getContent() {
            const encodedId = encodeURIComponent(editorOpen.id)
            const res = await fetch(`/api/content/${encodedId}`);
            const text = await res.text()
            setContent(text)
        }
          
        getContent()
    }, [editorOpen.id])

    return (
        <div className="editor">
            <header>
                <div>
                    <button onClick={() => setEditorOpen({open:false, id:""})}><XIcon size={32}/></button>
                    <h1>{editorOpen.id}</h1>
                </div>
                <div>
                    <button>View</button>
                    <button onClick={() => saveContent(editorOpen.id, content)}>Save</button>
                </div>
            </header>
            <textarea onChange={(ev) => setContent(ev.target.value)} value={content}/>
        </div>
    )
}