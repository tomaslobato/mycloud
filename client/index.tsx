import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import Header from "./components/Header"
import "./styles.css"
import Explorer from "./components/Explorer"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Explorer />,
      },
    ],
  },
])


const root = createRoot(document.getElementById("app"))

function Layout() {
  // const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <React.StrictMode>
      {/* {sidebarOpen && <Sidebar />} */}
      <div className="panel">
        <Header />
        <Outlet />
      </div>
    </React.StrictMode>
  )
}

root.render(<RouterProvider router={router} />)