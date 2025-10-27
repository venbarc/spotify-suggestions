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
        className={`grid lg:grid-cols-1 mb-8 items-start transition-all duration-500 ${
          showGlow ? 'animate-glow' : ''
        }`}
      >
        <div className={`
          bg-spotify-darkgray rounded-2xl p-8 border border-gray-800 
          transition-all duration-500
          ${showGlow 
            ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
            : 'border-gray-800'
          }
        `}>
          <h3 className="text-2xl font-bold mb-6 text-white">
            Your Recommendations
          </h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {recommendations.map((track, index) => (
              <TrackCard key={index} track={track} index={index} />
            ))}
          </div>

          <button
            onClick={onClearRecommendations}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
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
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-black font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{track.name}</p>
          <p className="text-sm text-gray-400 truncate">{track.artist}</p>
          <p className="text-xs text-gray-500 mt-1">{track.year}</p>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsSection;