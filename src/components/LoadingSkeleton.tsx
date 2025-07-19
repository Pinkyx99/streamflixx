export const MovieCardSkeleton = () => {
  return (
    <div className="bg-netflix-card border border-netflix-hover rounded-lg overflow-hidden animate-fade-in">
      <div className="aspect-[2/3] relative bg-netflix-hover">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-netflix-hover rounded mb-2" />
        <div className="h-3 bg-netflix-hover rounded w-2/3" />
      </div>
    </div>
  );
};

export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="h-8 bg-netflix-hover rounded w-48" />
      <div className="h-10 bg-netflix-hover rounded w-32" />
    </div>
  );
};