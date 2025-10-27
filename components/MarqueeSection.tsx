import { SpotifyArtist } from '../types/spotify';

interface MarqueeSectionProps {
  featuredArtists: SpotifyArtist[];
  onAddArtist: (artist: SpotifyArtist) => void;
}

export default function MarqueeSection({ featuredArtists, onAddArtist }: MarqueeSectionProps) {
  return (
    <section className="relative overflow-hidden mb-16">
      {/* Mobile: 2 columns, Desktop: 1 column */}
      <div className="block md:hidden">
        {/* Top Row - Left to Right (Mobile only) */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 px-4">Trending Artists</h3>
          <div className="relative">
            <div className="flex animate-marquee">
              {featuredArtists.slice(0, 30).map((artist) => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  onAddArtist={onAddArtist}
                  size="mobile"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Right to Left (Mobile only) */}
        <div>
          <div className="relative">
            <div className="flex animate-marquee-reverse">
              {featuredArtists.slice(0, 30).map((artist) => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  onAddArtist={onAddArtist}
                  size="mobile"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Single marquee */}
      <div className="hidden md:block">
        <h3 className="text-xl font-bold text-white mb-4 px-8">Trending Artists</h3>
        <div className="relative">
          <div className="flex animate-marquee">
            {featuredArtists.slice(0, 30).map((artist) => (
              <ArtistCard 
                key={artist.id} 
                artist={artist} 
                onAddArtist={onAddArtist}
                size="desktop"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ArtistCardProps {
  artist: SpotifyArtist;
  onAddArtist: (artist: SpotifyArtist) => void;
  size: 'mobile' | 'desktop';
}

function ArtistCard({ artist, onAddArtist, size }: ArtistCardProps) {
  const isMobile = size === 'mobile';
  
  return (
    <div
      onClick={() => onAddArtist(artist)}
      className={`
        flex-none mx-2 bg-gray-900 rounded-xl border border-gray-700 
        hover:border-green-500 transition-all duration-300 
        group cursor-pointer
        ${isMobile ? 'w-40 p-3' : 'w-48 p-4'}
      `}
    >
      <div className={`relative ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <img
          src={artist.images[0]?.url || '/placeholder-artist.jpg'}
          alt={artist.name}
          className={`
            object-cover rounded-lg mx-auto group-hover:brightness-110 transition-all
            ${isMobile ? 'w-32 h-32' : 'w-40 h-40'}
          `}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        {!isMobile && (
          <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {artist.name}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`text-white font-semibold truncate mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {artist.name}
        </p>
        <p className={`text-gray-400 truncate ${isMobile ? 'text-xs' : 'text-xs'}`}>
          {artist.genres[0] || (isMobile ? 'Artist' : 'Various Genres')}
        </p>
        {!isMobile && (
          <div className="flex items-center justify-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span className="text-green-400 text-xs">Popularity: {artist.popularity}%</span>
          </div>
        )}
      </div>
    </div>
  );
}