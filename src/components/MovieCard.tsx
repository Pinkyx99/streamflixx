import { useState } from 'react';
import { Stream } from '@/types/stream';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';

interface MovieCardProps {
  stream: Stream;
  onPlay: (stream: Stream) => void;
}

export const MovieCard = ({ stream, onPlay }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden bg-netflix-card border-netflix-hover cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-hover animate-fade-in"
      onClick={() => onPlay(stream)}
    >
      <div className="aspect-[2/3] relative">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-netflix-hover animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        )}
        
        {/* Movie image */}
        {!imageError && (
          <img
            src={stream.image}
            alt={stream.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Error fallback */}
        {imageError && (
          <div className="w-full h-full bg-netflix-hover flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-sm">Image not available</div>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <Play className="h-8 w-8 text-primary-foreground fill-current" />
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {stream.title}
        </h3>
      </div>
    </Card>
  );
};