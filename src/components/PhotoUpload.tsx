import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoUploadProps {
  onPhoto: (dataUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhoto }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') onPhoto(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex w-full flex-col items-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={t('photo.upload')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 active:bg-emerald-800"
      >
        {t('photo.upload')}
      </button>
    </div>
  );
};

export default PhotoUpload;
