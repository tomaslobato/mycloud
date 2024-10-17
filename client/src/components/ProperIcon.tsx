import { FileIcon, FileText, TableIcon } from "lucide-react"

export default function ProperIcon({ name }: { name: string }) {
    function getProperIcon() {
        const fileExtension = name.split('.').pop()?.toLowerCase()
        switch (fileExtension) {
            case "md":
            case "txt":
            case "log":
            case "docx":
                return <FileText size={19} />
            case "csv":
                return <TableIcon size={19} />
            default:
                return <FileIcon size={19} />
        }   
    }

    return (
        <>
            {getProperIcon()}
        </>
    )
}