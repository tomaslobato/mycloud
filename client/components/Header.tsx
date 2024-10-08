import { Menu } from "lucide-react"
import React from "react"
import { useLocation } from "react-router-dom"

// type Props = {
//     sidebarOpen: boolean
//     setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
// }

export default function Header() {  
    return (
        <header>
            <div>
                {/* <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button> */}
                <h1>MyCloud</h1>
            </div>
        </header>
    )
}