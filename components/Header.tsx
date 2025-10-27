export default function Header() {
  const handleConnectSpotify = () => {
    alert('Only authorized members can connect their Spotify. Contact the developer to connect yours.');
  };

  return (
    <header className="py-4 md:py-6 px-4 md:px-8 border-b border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo and Title */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-green-400">SpotyTaste</h1>
            <p className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
              Discover hidden gems based on your favorite artists
            </p>
          </div>
          
          {/* Spotify Connect Button - Mobile optimized */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="relative group">
              <button
                onClick={handleConnectSpotify}
                className="bg-green-500 hover:bg-green-400 text-black font-semibold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-2-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="hidden xs:inline">Connect</span>
                <span className="xs:hidden">Spotify</span>
              </button>
              
              {/* Tooltip for mobile - shows on hover/tap */}
              <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 sm:hidden">
                <p className="text-xs text-gray-300 text-center">
                  Contact dev to connect your Spotify
                </p>
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 border-t border-l border-gray-700 transform rotate-45"></div>
              </div>
            </div>
            
            {/* Text only visible on larger screens */}
            <p className="text-xs text-gray-400 text-center sm:text-right max-w-[200px] hidden sm:block">
              Only authorized members can connect their Spotify
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}