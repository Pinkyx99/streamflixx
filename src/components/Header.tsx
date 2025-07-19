import { Button } from '@/components/ui/button';
import { RefreshCw, Video } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export const Header = ({ onRefresh, isLoading = false }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-primary rounded-lg p-2">
          <Video className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">StreamFlix</h1>
          <p className="text-muted-foreground">Your personal media library</p>
        </div>
      </div>
      
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="border-netflix-hover hover:bg-netflix-hover text-foreground"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </header>
  );
};