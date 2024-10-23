import { useEffect, useState } from "react"
import Explorer from "./components/Explorer"
import Editor from "./components/Editor"
import LoginForm from "./components/LoginForm"

export default function App() {
  const [editorOpen, setEditorOpen] = useState<{ open: boolean, id: string } | null>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthed(true)
    }

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 1500

  if (!isAuthed) return <LoginForm setIsAuthed={setIsAuthed} />

  return (
    <>
      <div
        style={{
          display: editorOpen?.open && isMobile ? "none" : "block",
          width: editorOpen?.open ? "20%" : "100%",
          height: "100%"
        }}>
        <Explorer setEditorOpen={setEditorOpen} />
      </div>
      {editorOpen?.open ? <Editor editorOpen={editorOpen} setEditorOpen={setEditorOpen} windowWidth={windowWidth} /> : null}
    </>

  )
}