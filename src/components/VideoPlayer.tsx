import { useRef, useState } from 'react';
import { Stream } from '@/types/stream';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactHlsPlayer from 'react-hls-player';

interface VideoPlayerProps {
  stream: Stream;
  onClose: () => void;
}

export const VideoPlayer = ({ stream, onClose }: VideoPlayerProps) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  const togglePlay = () => {
    const video = playerRef.current;
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
    const video = playerRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seek = (time: number) => {
    const video = playerRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
  const handleTimeUpdate = () => {
    if (playerRef.current) {
      setCurrentTime(playerRef.current.currentTime);
    }
  };
  const handleDurationChange = () => {
    if (playerRef.current) {
      setDuration(playerRef.current.duration);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black animate-slide-up"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Video Player */}
      <ReactHlsPlayer
        playerRef={playerRef}
        src={stream.stream}
        autoPlay
        controls={false}
        className="w-full h-full object-contain"
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onClick={() => setShowControls(!showControls)}
        hlsConfig={{
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
        }}
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