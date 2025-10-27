import { AITrack } from '../types/spotify';
import { forwardRef } from 'react';

interface RecommendationsSectionProps {
  recommendations: AITrack[];
  showGlow: boolean;
  onClearRecommendations: () => void;
}

const RecommendationsSection = forwardRef<HTMLDivElement, RecommendationsSectionProps>(
  ({ recommendations, showGlow, onClearRecommendations }, ref) => {
    if (recommendations.length === 0) return null;

    return (
      <div 
        ref={ref}
        className={`w-full mb-8 transition-all duration-500 ${
          showGlow ? 'animate-glow' : ''
        }`}
      >
        <div className={`
          bg-spotify-darkgray rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-800 
          transition-all duration-500
          ${showGlow 
            ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
            : 'border-gray-800'
          }
        `}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
            Your Recommendations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {recommendations.map((track, index) => (
              <TrackCard key={`${track.spotify_id || track.name}-${index}`} track={track} index={index} />
            ))}
          </div>

          <button
            onClick={onClearRecommendations}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors text-sm sm:text-base"
          >
            Clear Recommendations
          </button>
        </div>
      </div>
    );
  }
);

RecommendationsSection.displayName = 'RecommendationsSection';

interface TrackCardProps {
  track: AITrack;
  index: number;
}

function TrackCard({ track, index }: TrackCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-green-500 transition-colors group">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Track number */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-xl flex items-center justify-center text-black font-bold text-xs sm:text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
            {index + 1}
          </div>
          
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate text-sm sm:text-base">{track.name}</p>
            <p className="text-gray-400 truncate text-xs sm:text-sm">{track.artist}</p>
            
            {/* Spotify link */}
            {track.external_url && (
              <a
                href={track.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-gray-900 hover:bg-green-500 border border-green-500 px-6 py-2 rounded-2xl mt-1 sm:mt-2 inline-block text-xs"
              >
                Open in Spotify
              </a>
            )}
          </div>
        </div>

        {/* Year on the right side */}
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-200 bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
            {track.year}
          </span>
        </div>
      </div>
      
      {/* Reason for recommendation */}
      {track.reason && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700">
          <p className="text-gray-400 italic text-xs leading-relaxed">"{track.reason}"</p>
        </div>
      )}
    </div>
  );
}

export default RecommendationsSection;