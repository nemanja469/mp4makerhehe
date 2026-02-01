import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressDisplayProps {
  progress: number;
  status: string;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
  outputInfo?: {
    fileName: string;
    fileSize: string;
    duration: string;
  };
}

export function ProgressDisplay({
  progress,
  status,
  isComplete,
  isError,
  errorMessage,
  outputInfo,
}: ProgressDisplayProps) {
  if (isError) {
    return (
      <div className="card-elevated p-6 border-destructive/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-destructive">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete && outputInfo) {
    return (
      <div className="card-elevated p-6 border-success/30 glow-success">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-success">
              Video created successfully!
            </h3>
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <span className="text-xs text-muted-foreground">File</span>
                <p className="text-sm text-foreground">{outputInfo.fileName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Size</span>
                <p className="text-sm text-foreground">{outputInfo.fileSize}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Duration</span>
                <p className="text-sm text-foreground">{outputInfo.duration}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-sm font-medium text-foreground">{status}</span>
      </div>
      
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-muted-foreground">Processing...</span>
        <span className="text-xs text-primary font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
