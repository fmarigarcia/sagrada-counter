interface Photo {
  id: string
  dataUrl: string
  takenAt: Date
}

interface PhotoGalleryProps {
  photos: Photo[]
  onDelete: (id: string) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onDelete }) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-5xl mb-3">🏛️</span>
        <p className="text-sm">No photos yet. Take or upload one!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative rounded-xl overflow-hidden bg-gray-100 shadow"
        >
          <img
            src={photo.dataUrl}
            alt={`Photo taken at ${photo.takenAt.toLocaleTimeString()}`}
            className="w-full h-36 object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 flex items-center justify-between">
            <span className="text-white text-xs">
              {photo.takenAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => onDelete(photo.id)}
              className="text-white text-xs bg-red-500 hover:bg-red-600 rounded-full px-2 py-0.5 transition-colors"
              aria-label="Delete photo"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export type { Photo }
export default PhotoGallery