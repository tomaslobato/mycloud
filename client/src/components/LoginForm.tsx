import { Loader2 } from "lucide-react"
import { FormEvent, useState } from "react"

interface Props {
    setIsAuthed: (value: boolean) => void
}

export default function LoginForm({ setIsAuthed }: Props) {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(ev: FormEvent) {
        ev.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password })
            })

            if (!res.ok) throw new Error("Invalid password")

            const json = await res.json()
            localStorage.setItem("authToken", json.token)
            setIsAuthed(true)

        } catch (err) {
            setError("Invalid password, try again")
        } finally { setLoading(false) }
    }

    return (
        <div className="login-screen">
            <form onSubmit={handleSubmit} >
                <label htmlFor="pwd">Your Password</label>
                <input type="password" id="pwd" required onChange={ev => setPassword(ev.target.value)} />
                {error && <span style={{ color: "red" }}>{error}</span>}
                <button type="submit" disabled={loading}>{loading ? <Loader2 className="loader" /> : "Log In"}</button>
            </form>
        </div>
    )
}