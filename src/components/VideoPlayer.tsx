import { useEffect, useRef, useState } from 'react';
import { Stream } from '@/types/stream';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Hls from 'hls.js';

interface VideoPlayerProps {
  stream: Stream;
  onClose: () => void;
}

export const VideoPlayer = ({ stream, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize HLS.js for m3u8 streams
    const initializePlayer = () => {
      if (stream.stream.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsRef.current = hls;
          
          hls.loadSource(stream.stream);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            setIsLoading(false);
            toast({
              title: "Streaming Error",
              description: "Failed to load HLS stream. Please try another video.",
              variant: "destructive",
            });
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = stream.stream;
        } else {
          toast({
            title: "Format Not Supported",
            description: "Your browser doesn't support HLS streaming.",
            variant: "destructive",
          });
        }
      } else {
        // Regular video files
        video.src = stream.stream;
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      toast({
        title: "Playback Error",
        description: "Unable to load this video. Please try another stream.",
        variant: "destructive",
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);

    initializePlayer();

    // Auto-hide controls
    let controlsTimeout: NodeJS.Timeout;
    const resetControlsTimer = () => {
      setShowControls(true);
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimer();
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case 'Space':
          togglePlay();
          break;
        case 'Escape':
          onClose();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
      resetControlsTimer();
    };

    video.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    resetControlsTimer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(controlsTimeout);
    };
  }, [stream.stream, isPlaying, onClose, toast]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        toast({
          title: "Playback Error",
          description: "Failed to start video playback.",
          variant: "destructive",
        });
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black animate-slide-up">
      {/* Video */}
      <video
        ref={videoRef}
        src={stream.stream}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        onClick={() => setShowControls(!showControls)}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mb-4" />
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-primary/60 animate-ping" />
            </div>
            <p className="text-foreground text-xl font-medium">Loading {stream.title}...</p>
            <p className="text-muted-foreground text-sm mt-2">Preparing your stream...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseMove={() => setShowControls(true)}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">{stream.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-foreground hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-foreground h-20 w-20 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 fill-current" />
            ) : (
              <Play className="h-10 w-10 fill-current ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer group">
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ left: duration ? `calc(${(currentTime / duration) * 100}% - 6px)` : '0%' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-foreground hover:bg-white/20 transition-colors duration-200"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(Math.max(0, currentTime - 10))}
                className="text-foreground hover:bg-white/20 transition-colors duration-200"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(Math.min(duration, currentTime + 10))}
                className="text-foreground hover:bg-white/20 transition-colors duration-200"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-foreground hover:bg-white/20 transition-colors duration-200"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <div className="text-sm text-muted-foreground ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="text-sm text-muted-foreground hidden md:block">
              ESC to exit • Space to play/pause • M to mute
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};