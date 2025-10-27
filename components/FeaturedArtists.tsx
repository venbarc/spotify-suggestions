import { SpotifyArtist } from '../types/spotify';

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
    <div className="bg-spotify-darkgray rounded-2xl p-8 border border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-white">
        Featured Artists
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
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
    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700 hover:border-green-500 transition-colors group">
      <img 
        src={artist.images[0]?.url || '/placeholder-artist.jpg'} 
        alt={artist.name}
        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-transparent group-hover:border-green-500 transition-colors"
      />
      <div className="relative group">
        <p className="font-semibold text-sm text-white mb-1">
          {artist.name.length > 12 ? `${artist.name.substring(0, 12)}..` : artist.name}
        </p>
        {artist.name.length > 12 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-green-500 text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap pointer-events-none shadow-lg font-medium">
            {artist.name}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-500"></div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3 truncate">
        {artist.genres[0] || 'Artist'}
      </p>
      <button
        onClick={() => onAddArtist(artist)}
        disabled={isDisabled}
        className="cursor-pointer w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black text-sm font-medium py-2 px-3 rounded-lg transition-colors"
      >
        {isAdded ? '✓' : '+'}
      </button>
    </div>
  );
}

function ArtistLoadingSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700 hover:border-green-500 transition-colors group">
      <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-700" />
      <div className="relative group">
        <p className="font-semibold text-sm text-white mb-1">
          Name..
        </p>
      </div>
      <p className="text-xs text-gray-400 mb-3">Genre...</p>
      <button className="w-full text-gray-100 text-sm font-medium py-2 px-3 rounded-lg bg-gray-700">
        +
      </button>
    </div>
  );
}