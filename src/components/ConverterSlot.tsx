import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { useVideoConverter } from '@/hooks/useVideoConverter';

interface ConverterSlotProps {
  slotNumber: number;
}

export function ConverterSlot({ slotNumber }: ConverterSlotProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioDurationText, setAudioDurationText] = useState<string>('');

  const converter = useVideoConverter();

  const canStart = imageFile && audioFile && !converter.isProcessing;
  const showProgress = converter.isProcessing || converter.isComplete || converter.isError;

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
          onFileSelect={setImageFile}
          file={imageFile}
          disabled={converter.isProcessing}
          previewUrl={imagePreview}
        />

        <FileUpload
          type="audio"
          accept="audio/mpeg,audio/mp3,audio/wav"
          onFileSelect={setAudioFile}
          file={audioFile}
          disabled={converter.isProcessing}
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
            disabled={!canStart}
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
}
