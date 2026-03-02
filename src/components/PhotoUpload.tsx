import { useRef } from 'react'

interface PhotoUploadProps {
  onPhoto: (dataUrl: string) => void
}

export function PhotoUpload({ onPhoto }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') onPhoto(result)
    }
    reader.readAsDataURL(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload photo from device"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-colors"
      >
        🖼️ Upload Photo
      </button>
    </div>
  )
}
