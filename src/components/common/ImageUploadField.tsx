import React, { useRef, useState } from 'react';
import { Upload, Link2, X, Image as ImageIcon, Check, Loader2, AlertTriangle } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (newUrlOrData: string) => void;
  placeholder?: string;
  helperText?: string;
  brandName?: string; // Optional context name for alt or label
  previewSize?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'wide' | 'auto';
  idPrefix?: string;
  // Optional server-side upload hook: when provided, a selected file is sent here first so it
  // can be persisted as a real physical file (e.g. under public/images/logo) and the returned
  // URL is stored via onChange. If it throws/returns null, falls back to embedding as base64.
  onUploadFile?: (file: File) => Promise<string | null>;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  helperText,
  brandName,
  previewSize = 'md',
  aspectRatio = 'square',
  idPrefix = 'upload',
  onUploadFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMode, setActiveMode] = useState<'url' | 'file'>('url');
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  }[previewSize];

  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video w-24 h-auto',
    auto: ''
  }[aspectRatio];

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) resolve(reader.result as string);
        else reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setFileName(file.name);

    try {
      const dataUrl = await readFileAsDataUrl(file);

      if (onUploadFile) {
        setIsUploading(true);
        try {
          const uploadedUrl = await onUploadFile(file);
          if (uploadedUrl) {
            onChange(uploadedUrl);
          } else {
            // Server-side upload unavailable (e.g. static deployment) — fall back to embedding
            onChange(dataUrl);
          }
        } catch (uploadErr) {
          console.error('Image upload failed, falling back to embedded image:', uploadErr);
          setUploadError('Server upload failed, using embedded preview instead.');
          onChange(dataUrl);
        } finally {
          setIsUploading(false);
        }
      } else {
        onChange(dataUrl);
      }
    } catch (err) {
      console.error('Failed to read selected file:', err);
      setUploadError('Could not read the selected file.');
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`text-xs font-bold text-slate-700 flex items-center gap-1.5`}>
          <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
          <span>{label}</span>
        </label>
        
        {/* Toggle between URL input & File upload */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              activeMode === 'url'
                ? 'bg-blue-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            URL Link
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('file');
              fileInputRef.current?.click();
            }}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              activeMode === 'file'
                ? 'bg-blue-900 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Upload Image
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Image Preview Thumbnail */}
        <div className="relative shrink-0 group">
          <div className={`${sizeClasses} ${aspectClasses} rounded-xl border overflow-hidden flex items-center justify-center p-1 border-slate-300 bg-slate-50 shadow-2xs`}>
            {value ? (
              <img
                src={value}
                alt={brandName || 'Logo / Part Image Preview'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
              title="Remove image"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Input Controls */}
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setFileName('');
              }}
              className="w-full border rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            id={`${idPrefix}-file`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Direct Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs bg-white border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-900 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-blue-900" />
            )}
            <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium pt-0.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Uploading <strong className="font-mono">{fileName}</strong> to server...</span>
        </div>
      )}

      {!isUploading && uploadError && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium pt-0.5">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {!isUploading && !uploadError && fileName && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Uploaded: <strong className="font-mono">{fileName}</strong></span>
        </div>
      )}

      {helperText && (
        <p className={`text-[10px] text-slate-400 pt-0.5`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
