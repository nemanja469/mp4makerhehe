import { useState, useCallback, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface ConversionState {
  isProcessing: boolean;
  progress: number;
  status: string;
  isComplete: boolean;
  isError: boolean;
  errorMessage: string;
  outputInfo: {
    fileName: string;
    fileSize: string;
    duration: string;
  } | null;
}

export function useVideoConverter() {
  const [state, setState] = useState<ConversionState>({
    isProcessing: false,
    progress: 0,
    status: '',
    isComplete: false,
    isError: false,
    errorMessage: '',
    outputInfo: null,
  });

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const abortRef = useRef(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getAudioDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.src = URL.createObjectURL(file);
    });
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('progress', ({ progress }) => {
      setState(prev => ({
        ...prev,
        progress: Math.min(20 + progress * 70, 90),
      }));
    });

    setState(prev => ({ ...prev, status: 'Loading video encoder...' }));

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return ffmpeg;
  };

  const convert = useCallback(async (imageFile: File, audioFile: File, audioDuration: number, slotNumber?: number) => {
    abortRef.current = false;

    setState({
      isProcessing: true,
      progress: 0,
      status: 'Preparing files...',
      isComplete: false,
      isError: false,
      errorMessage: '',
      outputInfo: null,
    });

    try {
      const ffmpeg = await loadFFmpeg();
      
      if (abortRef.current) return;

      setState(prev => ({ ...prev, progress: 10, status: 'Loading image...' }));
      
      const imageExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const audioExt = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3';
      
      await ffmpeg.writeFile(`input.${imageExt}`, await fetchFile(imageFile));
      
      if (abortRef.current) return;

      setState(prev => ({ ...prev, progress: 15, status: 'Loading audio...' }));
      await ffmpeg.writeFile(`input.${audioExt}`, await fetchFile(audioFile));

      if (abortRef.current) return;

      setState(prev => ({ ...prev, progress: 20, status: 'Rendering video...' }));

      // Create video from image + audio
      // Optimized for speed: ultrafast preset, capped resolution, lower bitrate
      await ffmpeg.exec([
        '-loop', '1',
        '-i', `input.${imageExt}`,
        '-i', `input.${audioExt}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'stillimage',
        '-vf', 'scale=min(iw\\,1920):min(ih\\,1080):force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-movflags', '+faststart',
        'output.mp4'
      ]);

      if (abortRef.current) return;

      setState(prev => ({ ...prev, progress: 95, status: 'Finalizing export...' }));

      const data = await ffmpeg.readFile('output.mp4');
      const uint8Array = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
      const blob = new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });

      // Generate output filename with slot prefix if provided
      const imageName = imageFile.name.replace(/\.[^/.]+$/, '');
      const audioName = audioFile.name.replace(/\.[^/.]+$/, '');
      const slotPrefix = slotNumber ? `slot${slotNumber}_` : '';
      const outputFileName = `${slotPrefix}${imageName}_${audioName}.mp4`;

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Cleanup FFmpeg files
      await ffmpeg.deleteFile(`input.${imageExt}`);
      await ffmpeg.deleteFile(`input.${audioExt}`);
      await ffmpeg.deleteFile('output.mp4');

      setState({
        isProcessing: false,
        progress: 100,
        status: 'Complete',
        isComplete: true,
        isError: false,
        errorMessage: '',
        outputInfo: {
          fileName: outputFileName,
          fileSize: formatFileSize(blob.size),
          duration: formatDuration(audioDuration),
        },
      });

    } catch (error) {
      console.error('Conversion error:', error);
      
      let errorMessage = 'Something went wrong while creating the video. Please try different files.';
      
      if (error instanceof Error) {
        if (error.message.includes('SharedArrayBuffer')) {
          errorMessage = 'Your browser does not support video encoding. Please try Chrome or Firefox.';
        } else if (error.message.includes('memory')) {
          errorMessage = 'The files are too large to process. Try smaller files.';
        }
      }

      setState({
        isProcessing: false,
        progress: 0,
        status: '',
        isComplete: false,
        isError: true,
        errorMessage,
        outputInfo: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({
      isProcessing: false,
      progress: 0,
      status: '',
      isComplete: false,
      isError: false,
      errorMessage: '',
      outputInfo: null,
    });
  }, []);

  return {
    ...state,
    convert,
    reset,
    getAudioDuration,
    formatDuration,
  };
}
