import { useRef, useState, useCallback } from 'react';
import { Upload, Image, Music, X, Check } from 'lucide-react';

interface FileUploadProps {
  type: 'image' | 'audio';
  accept: string;
  onFileSelect: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
  previewUrl?: string;
  audioDuration?: string;
  isCompressing?: boolean;
}

export function FileUpload({
  type,
  accept,
  onFileSelect,
  file,
  disabled = false,
  previewUrl,
  audioDuration,
  isCompressing = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }, [disabled, onFileSelect]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const Icon = type === 'image' ? Image : Music;
  const label = type === 'image' ? 'Select Image' : 'Select Audio';
  const formats = type === 'image' ? 'JPG, PNG, WEBP' : 'MP3, WAV';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          file-drop-zone cursor-pointer relative
          ${isDragActive ? 'active' : ''}
          ${file ? 'has-file' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {file ? (
          <div className="flex items-center gap-4">
            {type === 'image' && previewUrl ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-primary" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {type === 'audio' && audioDuration && (
                  <span className="text-xs text-primary">
                    {audioDuration}
                  </span>
                )}
              </div>
            </div>

            {!disabled && (
              <button
                onClick={handleRemove}
                className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        ) : isCompressing ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Compressing image...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Optimizing for faster conversion
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported: {formats}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
