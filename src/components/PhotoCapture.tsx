import { useRef, useState, useCallback } from 'react'

interface PhotoCaptureProps {
  onPhoto: (dataUrl: string) => void
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhoto }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreaming(true)
      }
    } catch {
      setError('Could not access camera. Please allow camera permission.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setStreaming(false)
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onPhoto(dataUrl)
    stopCamera()
  }, [onPhoto, stopCamera])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      {streaming ? (
        <>
          <div className="relative w-full rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="w-full max-h-72 object-cover"
              playsInline
              muted
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={takePhoto}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-colors"
            >
              📷 Capture
            </button>
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold px-5 py-3 rounded-full shadow-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={startCamera}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-5 py-3 rounded-full shadow-md transition-colors"
        >
          📷 Take Photo
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default PhotoCapture