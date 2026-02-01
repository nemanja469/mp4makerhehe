import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { useVideoConverter } from '@/hooks/useVideoConverter';
import { compressImage } from '@/lib/imageCompressor';

interface ConverterSlotProps {
  slotNumber: number;
}

export interface ConverterSlotRef {
  canStart: () => boolean;
  start: () => void;
}

export const ConverterSlot = forwardRef<ConverterSlotRef, ConverterSlotProps>(({ slotNumber }, ref) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioDurationText, setAudioDurationText] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageSelect = async (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }
    
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.85,
      });
      setImageFile(compressed);
    } catch (error) {
      console.error('Compression failed, using original:', error);
      setImageFile(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const converter = useVideoConverter();

  const canStartCheck = !!(imageFile && audioFile && !converter.isProcessing && !isCompressing);
  const showProgress = converter.isProcessing || converter.isComplete || converter.isError;

  useImperativeHandle(ref, () => ({
    canStart: () => !!(imageFile && audioFile && !converter.isProcessing && !isCompressing),
    start: () => {
      if (imageFile && audioFile && !converter.isProcessing && !isCompressing) {
        converter.convert(imageFile, audioFile, audioDuration, slotNumber);
      }
    },
  }), [imageFile, audioFile, audioDuration, slotNumber, converter, isCompressing]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview('');
    }
  }, [imageFile]);

  useEffect(() => {
    if (audioFile) {
      converter.getAudioDuration(audioFile)
        .then(duration => {
          setAudioDuration(duration);
          setAudioDurationText(converter.formatDuration(duration));
        })
        .catch(() => {
          setAudioDuration(0);
          setAudioDurationText('');
        });
    } else {
      setAudioDuration(0);
      setAudioDurationText('');
    }
  }, [audioFile]);

  const handleStart = () => {
    if (!imageFile || !audioFile) return;
    converter.convert(imageFile, audioFile, audioDuration, slotNumber);
  };

  const handleReset = () => {
    converter.reset();
    setImageFile(null);
    setAudioFile(null);
    setImagePreview('');
    setAudioDuration(0);
    setAudioDurationText('');
  };

  return (
    <div className="card-elevated p-4 space-y-4">
      {/* Slot Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{slotNumber}</span>
        </div>
        <h2 className="text-sm font-semibold text-foreground">Converter {slotNumber}</h2>
      </div>

      {/* File Inputs */}
      <div className="space-y-4">
        <FileUpload
          type="image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onFileSelect={handleImageSelect}
          file={imageFile}
          disabled={converter.isProcessing || isCompressing}
          previewUrl={imagePreview}
          isCompressing={isCompressing}
        />

        <FileUpload
          type="audio"
          accept="audio/mpeg,audio/mp3,audio/wav"
          onFileSelect={setAudioFile}
          file={audioFile}
          disabled={converter.isProcessing || isCompressing}
          audioDuration={audioDurationText}
        />
      </div>

      {/* Progress Section */}
      {showProgress && (
        <ProgressDisplay
          progress={converter.progress}
          status={converter.status}
          isComplete={converter.isComplete}
          isError={converter.isError}
          errorMessage={converter.errorMessage}
          outputInfo={converter.outputInfo || undefined}
        />
      )}

      {/* Action Button */}
      <div>
        {converter.isComplete || converter.isError ? (
          <button
            onClick={handleReset}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
          >
            <Sparkles className="w-4 h-4" />
            New Conversion
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!canStartCheck}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
          >
            {converter.isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
