import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoCaptureProps {
  onPhoto: (dataUrl: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhoto }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError(t('photo.cameraError'));
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onPhoto(dataUrl);
    stopCamera();
  }, [onPhoto, stopCamera]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      {streaming ? (
        <>
          <div className="relative w-full overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              className="max-h-72 w-full object-cover"
              playsInline
              muted
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={takePhoto}
              className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 active:bg-indigo-800"
            >
              {t('photo.capture')}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-full bg-gray-200 px-5 py-3 font-semibold text-gray-800 shadow-md transition-colors hover:bg-gray-300 active:bg-gray-400"
            >
              {t('diePicker.cancel')}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 active:bg-indigo-800"
        >
          {t('photo.capture')}
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoCapture;
