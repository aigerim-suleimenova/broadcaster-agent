import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { sampleDocuments } from "@/data/sampleDocuments"

interface MarkdownInputProps {
  onGenerate?: (content: string, file?: File) => void
  onContentChange?: (content: string) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

type SampleDocumentItem = {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  content: string
}

export function MarkdownInput({
  onGenerate,
  onContentChange,
  placeholder = "Enter your markdown content or drag and drop a file...",
  className,
  initialValue = ""
}: MarkdownInputProps) {
  const [content, setContent] = React.useState(initialValue)
  const [isDragging, setIsDragging] = React.useState(false)

  // Update content when initialValue changes (e.g., when going back to input view)
  React.useEffect(() => {
    if (initialValue) {
      setContent(initialValue)
    }
  }, [initialValue])

  React.useEffect(() => {
    onContentChange?.(content)
  }, [content, onContentChange])
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      setUploadedFile(file)

      // Read file content if it's a text/markdown file
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text()
        setContent(text)
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedFile(file)

      // Read file content if it's a text/markdown file
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text()
        setContent(text)
      }
    }
  }

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(content, uploadedFile || undefined)
    }
  }

  const loadSampleDocument = (documentId: string) => {
    const doc = sampleDocuments.find((d: SampleDocumentItem) => d.id === documentId)
    if (doc) {
      setContent(doc.content)
      setUploadedFile(null) // Clear any uploaded file
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Sample document chips */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Samples:</span>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {sampleDocuments.map((doc: SampleDocumentItem) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => loadSampleDocument(doc.id)}
              title={doc.description}
              className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium
                         bg-secondary/60 border border-blue-500/20 text-muted-foreground
                         hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-200
                         transition-colors whitespace-nowrap"
            >
              {doc.icon} {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea + drag target */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
            : "border-blue-500/30 bg-secondary/30 hover:border-blue-500/50"
        )}
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[260px] resize-y font-mono text-sm border-0 bg-transparent focus-visible:ring-0 rounded-xl"
          rows={12}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-xl backdrop-blur-sm border-2 border-blue-500">
            <div className="text-center">
              <Upload className="h-10 w-10 mx-auto mb-2 text-blue-400 animate-bounce" />
              <p className="text-sm font-medium text-blue-300">Drop file here</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".md,.txt,text/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-300 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploadedFile ? <span className="text-blue-300">{uploadedFile.name}</span> : "Upload .md"}
          </button>
          <span className="text-xs text-muted-foreground/50">
            {wordCount > 0 ? `${wordCount} words` : ''}
          </span>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={content.trim() === ""}
          size="sm"
        >
          Generate Dashboard
        </Button>
      </div>
    </div>
  )
}
