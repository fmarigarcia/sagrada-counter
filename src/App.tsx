import { useState } from 'react'
import { PhotoCapture } from './components/PhotoCapture'
import { PhotoUpload } from './components/PhotoUpload'
import { PhotoGallery, type Photo } from './components/PhotoGallery'
import './index.css'

function App() {
  const [photos, setPhotos] = useState<Photo[]>([])

  const addPhoto = (dataUrl: string) => {
    setPhotos((prev) => [
      { id: crypto.randomUUID(), dataUrl, takenAt: new Date() },
      ...prev,
    ])
  }

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white px-4 py-4 shadow-md">
        <h1 className="text-xl font-bold tracking-wide text-center">🏛️ Sagrada Counter</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col gap-5 px-4 py-5 max-w-lg mx-auto w-full">
        {/* Action buttons */}
        <section className="bg-white rounded-2xl shadow p-4 flex flex-col gap-4 items-center">
          <h2 className="text-gray-700 font-semibold text-base">Add a Photo</h2>
          <div className="flex flex-wrap gap-3 justify-center w-full">
            <PhotoCapture onPhoto={addPhoto} />
            <PhotoUpload onPhoto={addPhoto} />
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-gray-700 font-semibold text-base mb-3">
            Gallery{photos.length > 0 ? ` (${photos.length})` : ''}
          </h2>
          <PhotoGallery photos={photos} onDelete={deletePhoto} />
        </section>
      </main>
    </div>
  )
}

export default App

