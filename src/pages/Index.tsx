import { useState } from 'react';
import { Stream } from '@/types/stream';
import { useStreams } from '@/hooks/useStreams';
import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MovieCardSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const { streams, loading, error, refreshStreams } = useStreams();
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const handlePlayStream = (stream: Stream) => {
    setSelectedStream(stream);
  };

  const handleClosePlayer = () => {
    setSelectedStream(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header onRefresh={refreshStreams} isLoading={loading} />
        
        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="bg-netflix-card border border-netflix-hover rounded-lg p-8 max-w-md text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Loading Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={refreshStreams} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Movies grid */}
        {!loading && !error && streams.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {streams.map((stream, index) => (
              <MovieCard
                key={`${stream.title}-${index}`}
                stream={stream}
                onPlay={handlePlayStream}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && streams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">No Movies Found</h2>
              <p className="text-muted-foreground mb-6">
                Add some movies to your streams.json file to get started
              </p>
              <Button onClick={refreshStreams} variant="outline">
                Refresh Library
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Video player modal */}
      {selectedStream && (
        <VideoPlayer
          stream={selectedStream}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default Index;
