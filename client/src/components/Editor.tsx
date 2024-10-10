import React, { useEffect, useState } from "react"
import { saveContent } from "../actions"
import { XIcon } from "lucide-react"

type Props = {
    editorOpen: {open:boolean, id:string}
    setEditorOpen: React.Dispatch<React.SetStateAction<{open:boolean, id:string} | null>>
    windowWidth: number
}

export default function Editor({ editorOpen, setEditorOpen, windowWidth }: Props) {
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

    function getName(id: string) {
        const lastSlashIndex = id.lastIndexOf('/');
        if (lastSlashIndex === -1) {
          return id;
        }
        return id.substring(lastSlashIndex + 1);
      }

    return (
        <div className="editor">
            <header>
                <div>
                    <button onClick={() => setEditorOpen({open:false, id:""})}><XIcon size={windowWidth < 600 ? 24 : 32}/></button>
                    <h1>{getName(editorOpen.id)}</h1>
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