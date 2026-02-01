import { useState, useEffect } from 'react';
import { Video, Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { useVideoConverter } from '@/hooks/useVideoConverter';

const Index = () => {
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
    converter.convert(imageFile, audioFile, audioDuration);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Video Converter</h1>
              <p className="text-sm text-muted-foreground">Image + Audio → Video</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* File Upload Section */}
          <section className="card-elevated p-6 space-y-6">
            <FileUpload
              type="image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onFileSelect={setImageFile}
              file={imageFile}
              disabled={converter.isProcessing}
              previewUrl={imagePreview}
            />

            <div className="border-t border-border" />

            <FileUpload
              type="audio"
              accept="audio/mpeg,audio/mp3,audio/wav"
              onFileSelect={setAudioFile}
              file={audioFile}
              disabled={converter.isProcessing}
              audioDuration={audioDurationText}
            />
          </section>

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

          {/* Action Buttons */}
          <div className="flex gap-4">
            {converter.isComplete || converter.isError ? (
              <button
                onClick={handleReset}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create Another
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={!canStart}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {converter.isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info Section */}
          <section className="text-center py-6">
            <p className="text-xs text-muted-foreground">
              All processing happens locally in your browser. No files are uploaded to any server.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
