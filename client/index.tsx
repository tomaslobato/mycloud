import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import Header from "./components/Header"
import "./styles.css"
import Explorer from "./components/Explorer"
import Editor from "./components/Editor"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />
  },
])


const root = createRoot(document.getElementById("app"))

function Layout() {
  const [editorOpen, setEditorOpen] = useState<{open: boolean, id: string} | null>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 600;

  return (
    <React.StrictMode>
      {/* {sidebarOpen && <Sidebar />} */}
      <div className={`panel`} style={{ display: editorOpen?.open && isMobile ? "none" : "block", width: editorOpen?.open ? "25%" : "100%"}} >
        <Header />
        <Explorer setEditorOpen={setEditorOpen}/>
      </div>    
      {editorOpen?.open ? <Editor editorOpen={editorOpen} setEditorOpen={setEditorOpen}/> : null}
    </React.StrictMode>
  )
}

root.render(<RouterProvider router={router} />)