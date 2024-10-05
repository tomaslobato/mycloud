import { Menu } from "lucide-react"
import React from "react"
import { useLocation } from "react-router-dom"

type Props = {
    sidebarOpen: boolean
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Header({ sidebarOpen, setSidebarOpen }: Props) {
    const location = useLocation()

    return (
        <header>
            <div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
                <h1>{location.pathname.split("/").pop()}</h1>
            </div>
        </header>
    )
}