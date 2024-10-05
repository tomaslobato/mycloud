import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import "./styles.css"
import Explorer from "./Explorer"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "explorer",
        element: <Explorer />,
      },
    ],
  },
])


const root = createRoot(document.getElementById("app"))

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <React.StrictMode>
      {sidebarOpen && <Sidebar />}
      <div className="panel">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Outlet />
      </div>
    </React.StrictMode>
  )
}

root.render(<RouterProvider router={router} />)