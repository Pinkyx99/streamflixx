import { useState, useEffect, useCallback } from 'react';
import { Stream } from '@/types/stream';
import { useToast } from '@/hooks/use-toast';

export const useStreams = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStreams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/streams.json');
      if (!response.ok) {
        throw new Error('Failed to load streams data');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid streams data format');
      }
      
      // Validate stream data structure
      const validStreams = data.filter((stream): stream is Stream => {
        return (
          typeof stream === 'object' &&
          typeof stream.title === 'string' &&
          typeof stream.image === 'string' &&
          typeof stream.stream === 'string'
        );
      });
      
      if (validStreams.length !== data.length) {
        console.warn(`Filtered out ${data.length - validStreams.length} invalid stream entries`);
      }
      
      setStreams(validStreams);
      
      if (validStreams.length === 0) {
        setError('No valid streams found');
        toast({
          title: "No Content",
          description: "No valid streams were found in the data file.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load streams';
      setError(errorMessage);
      toast({
        title: "Loading Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshStreams = useCallback(() => {
    toast({
      title: "Refreshing...",
      description: "Loading latest content from streams.json",
    });
    loadStreams();
  }, [loadStreams, toast]);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  return {
    streams,
    loading,
    error,
    refreshStreams,
    retryLoad: loadStreams
  };
};