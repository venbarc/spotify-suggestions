import { SpotifyArtist } from '../types/spotify';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23374151" width="200" height="200"/%3E%3Ccircle cx="100" cy="70" r="30" fill="%239CA3AF"/%3E%3Cpath d="M60 150 Q60 120 100 120 Q140 120 140 150 L140 170 Q140 180 130 180 L70 180 Q60 180 60 170 Z" fill="%239CA3AF"/%3E%3C/svg%3E';

interface FeaturedArtistsProps {
  featuredArtists: SpotifyArtist[];
  userArtists: SpotifyArtist[];
  loading: boolean;
  onAddArtist: (artist: SpotifyArtist) => void;
  onShuffleArtists: () => void;
}

export default function FeaturedArtists({
  featuredArtists,
  userArtists,
  loading,
  onAddArtist,
  onShuffleArtists
}: FeaturedArtistsProps) {
  return (
    <div className="bg-spotify-darkgray rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-800">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
        Featured Artists
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <ArtistLoadingSkeleton key={index} />
          ))
        ) : (
          featuredArtists.slice(0, 6).map((artist) => (
            <FeaturedArtistCard 
              key={artist.id} 
              artist={artist} 
              userArtists={userArtists}
              onAddArtist={onAddArtist}
            />
          ))
        )}
      </div>

      <button 
        onClick={onShuffleArtists}
        disabled={loading}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Loading...
          </div>
        ) : (
          'Shuffle Featured Artists'
        )}
      </button>
    </div>
  );
}

interface FeaturedArtistCardProps {
  artist: SpotifyArtist;
  userArtists: SpotifyArtist[];
  onAddArtist: (artist: SpotifyArtist) => void;
}

function FeaturedArtistCard({ artist, userArtists, onAddArtist }: FeaturedArtistCardProps) {
  const isAdded = userArtists.some(a => a.id === artist.id);
  const isDisabled = userArtists.length >= 5 || isAdded;

  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center border border-gray-700 hover:border-green-500 transition-colors group">
      <img 
        src={artist.images?.[0]?.url || PLACEHOLDER_IMAGE} 
        alt={artist.name}
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-2 sm:mb-3 object-cover border-2 border-transparent group-hover:border-green-500 transition-colors"
      />
      <div className="relative group">
        <p className="font-semibold text-white mb-1 text-xs sm:text-sm">
          {artist.name.length > 10 ? `${artist.name.substring(0, 10)}..` : artist.name}
        </p>
        {artist.name.length > 10 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 px-2 py-1 bg-green-500 text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap pointer-events-none shadow-lg font-medium">
            {artist.name}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-500"></div>
          </div>
        )}
      </div>
      <p className="text-gray-400 mb-2 sm:mb-3 truncate text-xs">
        {artist.genres?.[0]?.split(' ')[0] || 'Artist'}
      </p>
      <button
        onClick={() => onAddArtist(artist)}
        disabled={isDisabled}
        className="cursor-pointer w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors text-xs sm:text-sm"
      >
        {isAdded ? '✓' : '+'}
      </button>
    </div>
  );
}

function ArtistLoadingSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-4 text-center border border-gray-700">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-2 sm:mb-3 bg-gray-700" />
      <div className="relative">
        <p className="font-semibold text-white mb-1 text-xs sm:text-sm">
          Name..
        </p>
      </div>
      <p className="text-gray-400 mb-2 sm:mb-3 text-xs">Genre...</p>
      <button className="w-full text-gray-100 font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-gray-700 text-xs sm:text-sm">
        +
      </button>
    </div>
  );
}