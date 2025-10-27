import { useState } from 'react';
import { SpotifyArtist } from '../types/spotify';

interface ArtistSelectionProps {
  userArtists: SpotifyArtist[];
  onAddArtist: (artist: SpotifyArtist) => void;
  onRemoveArtist: (artistId: string) => void;
  onClearAllArtists: () => void;
  onGenerateRecommendations: () => void;
  generating: boolean;
}

export default function ArtistSelection({
  userArtists,
  onAddArtist,
  onRemoveArtist,
  onClearAllArtists,
  onGenerateRecommendations,
  generating
}: ArtistSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
  const [searching, setSearching] = useState(false);

  const searchArtists = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search-artists?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const artists: SpotifyArtist[] = await response.json();
        setSearchResults(artists);
      }
    } catch (error) {
      console.error('Error searching artists:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddArtist = (artist: SpotifyArtist) => {
    onAddArtist(artist);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="bg-spotify-darkgray rounded-2xl p-8 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          Your Favorite Artists
        </h3>
        {userArtists.length > 0 && (
          <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            {userArtists.length}/5 <span className="hidden sm:inline"> selected</span>
          </span>
        )}
      </div>

      <SearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchArtists={searchArtists}
        searching={searching}
      />

      {searchResults.length > 0 && (
        <SearchResults 
          searchResults={searchResults} 
          onAddArtist={handleAddArtist} 
        />
      )}

      <SelectedArtistsGrid
        userArtists={userArtists}
        onRemoveArtist={onRemoveArtist}
      />

      <ActionButtons
        userArtists={userArtists}
        onClearAllArtists={onClearAllArtists}
        onGenerateRecommendations={onGenerateRecommendations}
        generating={generating}
      />
    </div>
  );
}

// Sub-components for ArtistSelection
interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchArtists: (query: string) => void;
  searching: boolean;
}

function SearchInput({ searchQuery, setSearchQuery, searchArtists, searching }: SearchInputProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchArtists(e.target.value);
          }}
          placeholder="Search for artists..."
          className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SearchResultsProps {
  searchResults: SpotifyArtist[];
  onAddArtist: (artist: SpotifyArtist) => void;
}

function SearchResults({ searchResults, onAddArtist }: SearchResultsProps) {
  return (
    <div className="mt-3 bg-gray-800 rounded-xl border border-gray-700 max-h-48 overflow-y-auto">
      {searchResults.map(artist => (
        <div
          key={artist.id}
          onClick={() => onAddArtist(artist)}
          className="p-4 hover:bg-gray-700 cursor-pointer flex items-center gap-4 transition-colors border-b border-gray-700 last:border-b-0"
        >
          <img
            src={artist.images[0]?.url || '/placeholder-artist.jpg'}
            alt={artist.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <span className="text-white font-medium">{artist.name}</span>
            {artist.genres[0] && (
              <p className="text-sm text-gray-400">{artist.genres[0]}</p>
            )}
          </div>
          <div className="text-green-500 font-bold text-lg">+</div>
        </div>
      ))}
    </div>
  );
}

interface SelectedArtistsGridProps {
  userArtists: SpotifyArtist[];
  onRemoveArtist: (artistId: string) => void;
}

function SelectedArtistsGrid({ userArtists, onRemoveArtist }: SelectedArtistsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {userArtists.map((artist) => (
        <SelectedArtistCard 
          key={artist.id} 
          artist={artist} 
          onRemoveArtist={onRemoveArtist} 
        />
      ))}
      
      {/* Empty slots */}
      {[...Array(5 - userArtists.length)].map((_, index) => (
        <EmptyArtistSlot key={index} />
      ))}
    </div>
  );
}

interface SelectedArtistCardProps {
  artist: SpotifyArtist;
  onRemoveArtist: (artistId: string) => void;
}

function SelectedArtistCard({ artist, onRemoveArtist }: SelectedArtistCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center relative group border border-gray-700 hover:border-green-500 transition-colors">
      <button
        onClick={() => onRemoveArtist(artist.id)}
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 text-sm font-bold cursor-pointer transition-colors z-10"
      >
        ×
      </button>
      <img 
        src={artist.images[0]?.url || '/placeholder-artist.jpg'} 
        alt={artist.name}
        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-green-500"
      />
      <div className="relative group">
        <p className="font-semibold text-sm text-white mb-1">
          {artist.name.length > 12 ? `${artist.name.substring(0, 12)}..` : artist.name}
        </p>
        {artist.name.length > 12 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-green-500 text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 whitespace-nowrap pointer-events-none shadow-lg font-medium">
            {artist.name}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyArtistSlot() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
      <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
        <span className="text-gray-400 text-2xl">+</span>
      </div>
      <p className="text-sm text-gray-400">Add Artist</p>
    </div>
  );
}

interface ActionButtonsProps {
  userArtists: SpotifyArtist[];
  onClearAllArtists: () => void;
  onGenerateRecommendations: () => void;
  generating: boolean;
}

function ActionButtons({ 
  userArtists, 
  onClearAllArtists, 
  onGenerateRecommendations, 
  generating 
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {userArtists.length > 0 && (
        <button
          onClick={onClearAllArtists}
          className="w-full sm:flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-6 rounded-xl transition-colors"
        >
          Clear Artists
        </button>
      )}
      <button 
        onClick={onGenerateRecommendations}
        disabled={generating || userArtists.length === 0}
        className={`w-full ${userArtists.length > 0 ? 'sm:flex-1' : ''} bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100`}
      >
        {generating ? (
          <div className="flex items-center justify-center gap-3 text-green-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            Generating...
          </div>
        ) : (
          `Get Recommendations`
        )}
      </button>
    </div>
  );
}