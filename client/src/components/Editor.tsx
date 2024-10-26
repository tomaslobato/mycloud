import React, { useEffect, useRef, useState } from "react"
import { saveContent } from "../actions"
import { Loader2, MinusIcon, PlusIcon, XIcon } from "lucide-react"
import Markdown from "react-markdown"

type Props = {
    editorOpen: { open: boolean, id: string }
    setEditorOpen: React.Dispatch<React.SetStateAction<{ open: boolean, id: string } | null>>
    windowWidth: number
}

export default function Editor({ editorOpen, setEditorOpen, windowWidth }: Props) {
    const [content, setContent] = useState("")
    const [saving, setSaving] = useState(false)
    const [viewMode, setViewMode] = useState<"table" | "raw" | "md" | "edit">("edit")
    const [loading, setLoading] = useState(true)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isImage, setIsImage] = useState(false)
    const [isVideo, setIsVideo] = useState(false)
    const [isCsv, setIsCsv] = useState(false)
    const [csvData, setCsvData] = useState<string[][]>([])

    useEffect(() => {
        async function getContent() {
            setLoading(true)
            const encodedId = encodeURIComponent(editorOpen.id)
            const res = await fetch(`/api/content/${encodedId}`)

            const fileExtension = editorOpen.id.split(".").pop()?.toLowerCase()
            const isImageFile = ["jpg", "jpeg", "png", "gif", "webp", "img"].includes(fileExtension || "")
            const isVideoFile = ["mp4", "mkv"].includes(fileExtension || "")

            if (isImageFile) {
                setIsImage(true)
                setContent("")
                setLoading(false)
            } else if (isVideoFile) {
                setIsVideo(true)
                setContent("")
                setLoading(false)
            } else {
                setIsImage(false)
                const text = await res.text()
                setContent(text)
                if (fileExtension === "csv") {
                    setIsCsv(true)
                    const parsedCsv = parseCSV(text)
                    setCsvData(parsedCsv)
                    setViewMode("table")
                    setLoading(false)
                } else {
                    setIsCsv(false)
                    setCsvData([])
                    setViewMode("edit")
                    setLoading(false)
                }
            }


        }

        getContent()
    }, [editorOpen.id])

    useEffect(() => {
        if (isCsv) {
            const csvContent = stringifyCSV(csvData)
            setContent(csvContent)
        }
    }, [csvData, isCsv])

    //KEYS
    useEffect(() => {
        async function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault()
                handleSave()
            }
            if (viewMode === "edit" && event.key === "Tab") {
                event.preventDefault()

                const textarea = textareaRef.current
                if (!textarea) return

                const start = textarea.selectionStart
                const end = textarea.selectionEnd

                const newContent = content.substring(0, start) + "    " + content.substring(end)
                setContent(newContent)

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 4
                }, 0)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [editorOpen.id, content, viewMode])

    function getName(id: string) {
        const lastSlashIndex = id.lastIndexOf("/")
        if (lastSlashIndex === -1) {
            return id
        }
        return id.substring(lastSlashIndex + 1)
    }

    async function handleSave() {
        try {
            setSaving(true)
            const dataToSave = isCsv && viewMode === "table" ? stringifyCSV(csvData) : content
            await saveContent(editorOpen.id, dataToSave)
        } catch (error) {
            console.error("Error saving content:", error)
        } finally {
            setSaving(false)
        }
    }


    //CSV
    function parseCSV(text: string): string[][] {
        return text.split("\n").map(row => row.split(","))
    }
    function stringifyCSV(data: string[][]): string {
        return data.map(row => row.join(",")).join("\n")
    }

    function handleCellChange(rowIndex: number, colIndex: number, value: string) {
        const newCsvData = csvData.map((row, rIndex) =>
            row.map((cell, cIndex) =>
                rIndex === rowIndex && cIndex === colIndex ? value : cell
            )
        )
        setCsvData(newCsvData)
    }

    function addNewRow() {
        const newRow = new Array(csvData[0].length).fill("")
        setCsvData([...csvData, newRow])
    }

    function addNewColumn() {
        const newCsvData = csvData.map(row => [...row, ""])
        setCsvData(newCsvData)
    }

    function removeColumn(colIndex: number) {
        const newCsvData = csvData.map((row) =>
            row.filter((_, index) => index !== colIndex)
        )
        setCsvData(newCsvData)
    }

    if (loading) return <div className="loading-screen"><Loader2 className="loader" size={80} /></div>

    return (
        <div className="editor" style={{ width: windowWidth < 1500 ? "100%" : "80%" }}>
            <header>
                <div className="x-div">
                    <button onClick={() => setEditorOpen({ open: false, id: "" })}><XIcon size={windowWidth < 600 ? 26 : 32} /></button>
                    <h1>{getName(editorOpen.id)}</h1>
                </div>
                {(!isImage && !isVideo) && <div>
                    {isCsv ?
                        <>
                            {viewMode === "raw"
                                ? <button onClick={() => setViewMode("table")}>View Table</button>
                                : <button onClick={() => setViewMode("raw")}>View Raw</button>
                            }
                        </>
                        : <>
                            {viewMode === "edit"
                                ? <button onClick={() => setViewMode("md")}>View MD</button>
                                : <button onClick={() => setViewMode("edit")}>Edit</button>
                            }
                        </>
                    }
                    <button onClick={handleSave}>{saving ? <Loader2 className="loader" /> : "Save"}</button>
                </div>}
            </header>
            {isImage ? (
                <div className="image-container">
                    <img
                        src={`/api/content/${encodeURIComponent(editorOpen.id)}`}
                        alt={getName(editorOpen.id)}
                    />
                </div>
            ) : isVideo ? (
                <div className="video-container" >
                    <video
                        src={`/api/content/${encodeURIComponent(editorOpen.id)}`}
                        controls
                        autoPlay={false}
                        preload="metadata"
                    />
                </div>
            ) : isCsv ? (
                <>
                    {viewMode === "table" ? <div className="table-container">
                        <div style={{ display: "flex" }}>
                            <table>
                                <thead>
                                    <tr>
                                        {csvData[0]?.map((header, index) => (
                                            <th key={index}>
                                                <button style={{ width: "100%" }} onClick={() => removeColumn(index)}> <MinusIcon size={12} /> </button>
                                                <input
                                                    value={header}
                                                    onChange={(ev) => handleCellChange(0, index, ev.target.value)}
                                                    style={{ width: "100%" }}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvData.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, colIndex) => (
                                                <td key={colIndex}>
                                                    <input
                                                        value={cell}
                                                        onChange={(ev) => handleCellChange(rowIndex + 1, colIndex, ev.target.value)}
                                                        style={{ width: "100%" }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={addNewColumn} style={{ writingMode: "vertical-lr", padding: 0 }}><PlusIcon size={14} /></button>
                        </div>

                        <div>
                            <button onClick={addNewRow} style={{ display: "flex", alignItems: "center", width: "100%", padding: 0 }}><PlusIcon size={14} /></button>
                        </div>
                    </div>
                        : <textarea ref={textareaRef} onChange={(ev) => setContent(ev.target.value)} value={content} />}
                </>
            ) : (
                <>
                    {viewMode === "edit"
                        ? <textarea ref={textareaRef} onChange={(ev) => setContent(ev.target.value)} value={content} />
                        : <Markdown className="markdown">{content.replace(/\n/g, '  \n')}</Markdown>
                    }
                </>
            )
            }
        </div>
    )
}