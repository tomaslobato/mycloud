import { useEffect, useState } from "react"
import Explorer from "./components/Explorer"
import Editor from "./components/Editor"

export default function App() {
  const [editorOpen, setEditorOpen] = useState<{ open: boolean, id: string } | null>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 1500

  return (
    <>
      <div
        style={{
          display: editorOpen?.open && isMobile ? "none" : "block",
          width: editorOpen?.open ? "20%" : "100%",
          height: "100%"
        }}>

        <header>
          <h1>MyCloud</h1>
        </header>
        <Explorer setEditorOpen={setEditorOpen} />
      </div>
      {editorOpen?.open ? <Editor editorOpen={editorOpen} setEditorOpen={setEditorOpen} windowWidth={windowWidth} /> : null}
    </>

  )
}