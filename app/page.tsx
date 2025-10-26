"use client";

import { useState, useEffect } from 'react';
import { SpotifyArtist } from '../types/spotify';

export default function Home() {
  const [featuredArtists, setFeaturedArtists] = useState<SpotifyArtist[]>([]);
  const [userTopArtists, setUserTopArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token in URL on component mount and handle authentication
  useEffect(() => {
    // Check if already authenticated from previous session
    const token = localStorage.getItem('spotify_access_token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchUserTopArtists(token);
    }
    
    // Fetch random featured artists
    fetchRandomArtists();
  }, []);

  const fetchRandomArtists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/random-artists');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch artists');
      }
      
      const artists: SpotifyArtist[] = await response.json();
      setFeaturedArtists(artists);
    } 
    catch (error) {
      console.error('Error fetching artists:', error);
      setFeaturedArtists([]);
    } 
    finally {
      setLoading(false);
    }
  };

  const fetchUserTopArtists = async (accessToken: string) => {
    setUserLoading(true);
    try 
    {
      const apiSpotify = process.env.NEXT_PUBLIC_API_SPOTIFY;
      const response = await fetch(`${apiSpotify}/v1/me/top/artists?limit=5&time_range=short_term`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserTopArtists(data.items);
      } else {
        console.error('Failed to fetch user top artists');
        setUserTopArtists([]);
      }
    } catch (error) {
      console.error('Error fetching user top artists:', error);
      setUserTopArtists([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLogin = () => {
    const redirectUri = process.env.NEXT_PUBLIC_CALLBACK_URL;
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID

    if (!redirectUri) {
      console.error('NEXT_PUBLIC_CALLBACK_URL url is not set');
      alert('Configuration error: Please contact support');
      return;
    }

    if (!clientId) {
      console.error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set');
      alert('Configuration error: Please contact support');
      return;
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'user-top-read user-read-email user-read-private',
      show_dialog: 'true',
      locale: 'en'
    });

    window.location.href = `https://accounts.spotify.com/en/authorize?${params.toString()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    setIsAuthenticated(false);
    setUserTopArtists([]);
  };

  const refreshTopArtists = () => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      fetchUserTopArtists(token);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400">SpotyTaste</h1>
            <p className="text-white font-semibold mt-2">
              Discover your next favorite music based on your taste..
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <p className="text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 to-green-500 bg-clip-text text-transparent">
            Your next loop starts here.
          </p>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-black">
            Connect your Spotify and get 10 personalized song suggestions based on your top 5 artists
          </p>
        </section>

        {/* How It Works */}
        <div className="text-center mb-16">
          <div className="bg-spotify-darkgray rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-spotify-green">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold mb-2">Connect Spotify</h4>
                <p className="text-sm text-gray-400">Secure login with your account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold mb-2">Analyze Top 5</h4>
                <p className="text-sm text-gray-400">We discover your most-played artists</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold mb-2">Get Suggestions</h4>
                <p className="text-sm text-gray-400">Receive 10 personalized song matches</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold text-lg">4</span>
                </div>
                <h4 className="font-semibold mb-2">Discover Music</h4>
                <p className="text-sm text-gray-400">Expand your music library instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Artists */}
          <div className="bg-spotify-darkgray rounded-2xl p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-100">
              {isAuthenticated ? 'Your Top Artists' : 'Featured Artists'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              {isAuthenticated ? (
                // User's top artists
                userLoading ? (
                  // Loading state for user artists
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-500 rounded-full mx-auto mb-2 md:mb-3 animate-pulse"></div>
                        <p className="font-semibold text-xs md:text-sm">Loading...</p>
                        <p className="text-xs text-gray-400">Artist</p>
                      </div>
                    ))}
                  </>
                ) : userTopArtists.length > 0 ? (
                  // Display user's actual top artists
                  userTopArtists.map((artist) => (
                    <div key={artist.id} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center hover:bg-spotify-lightgray transition-colors">
                      <img 
                        src={artist.images[0]?.url || '/placeholder-artist.jpg'} 
                        alt={artist.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-2 md:mb-3 object-cover"
                      />
                      <div className="relative group">
                        <p className="font-semibold text-xs md:text-sm cursor-pointer">
                          {artist.name.length > 8 ? `${artist.name.substring(0, 8)}..` : artist.name}
                        </p>
                        {artist.name.length > 8 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-spotify-green text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap pointer-events-none shadow-lg font-medium">
                            {artist.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-spotify-green"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{artist.genres[0] || 'Artist'}</p>
                    </div>
                  ))
                ) : (
                  // No user artists found
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-500 rounded-full mx-auto mb-2 md:mb-3"></div>
                        <p className="font-semibold text-xs md:text-sm">No artists found</p>
                        <p className="text-xs text-gray-400">Try again</p>
                      </div>
                    ))}
                  </>
                )
              ) : (
                // Featured artists for non-logged in users
                loading ? (
                  // Loading state
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-500 rounded-full mx-auto mb-2 md:mb-3 animate-pulse"></div>
                        <p className="font-semibold text-xs md:text-sm">Loading...</p>
                        <p className="text-xs text-gray-400">Artist</p>
                      </div>
                    ))}
                  </>
                ) : featuredArtists.length > 0 ? (
                  // Display actual featured artists
                  featuredArtists.map((artist) => (
                    <div key={artist.id} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center hover:bg-spotify-lightgray transition-colors">
                      <img 
                        src={artist.images[0]?.url || '/placeholder-artist.jpg'} 
                        alt={artist.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-2 md:mb-3 object-cover"
                      />
                      <div className="relative group">
                        <p className="font-semibold text-xs md:text-sm cursor-pointer">
                          {artist.name.length > 8 ? `${artist.name.substring(0, 8)}..` : artist.name}
                        </p>
                        {artist.name.length > 8 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-spotify-green text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap pointer-events-none shadow-lg font-medium">
                            {artist.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-spotify-green"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{artist.genres[0] || 'Artist'}</p>
                    </div>
                  ))
                ) : (
                  // Error state
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="bg-spotify-gray rounded-lg p-3 md:p-4 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-500 rounded-full mx-auto mb-2 md:mb-3"></div>
                        <p className="font-semibold text-xs md:text-sm">No artists found</p>
                        <p className="text-xs text-gray-400">Try again</p>
                      </div>
                    ))}
                  </>
                )
              )}
            </div>
            {isAuthenticated ? '' : 
              <button 
                onClick={fetchRandomArtists}
                disabled={loading}
                className="w-full bg-spotify-gray hover:bg-spotify-green hover:text-green-500 text-white font-bold py-3 px-4 md:px-6 rounded-full transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? 'Loading...' : 'Shuffle Artists'}
              </button>
            }
          </div>

          {/* Right Column - Login/Get Started */}
          <div className="bg-spotify-darkgray rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-white">
              {isAuthenticated ? 'Welcome!' : 'Get Started'}
            </h3>
            
            {isAuthenticated ? (
              <>
                <p className="text-gray-300 mb-6">
                  We've analyzed your top 5 artists and are ready to generate personalized recommendations for you!
                </p>
                <button 
                  onClick={() => {
                    // Add your recommendation logic here
                    alert('Song recommendations feature coming soon!');
                  }}
                  className="w-full bg-spotify-green hover:bg-green-500 text-black font-bold py-4 px-6 rounded-full transition-colors mb-4"
                >
                  Get Song Recommendations
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full border border-gray-600 hover:border-red-500 hover:text-red-500 text-gray-300 font-bold py-4 px-6 rounded-full transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-6">
                  Connect your Spotify account to see your top artists and get personalized recommendations
                </p>
                
                <button 
                  onClick={handleLogin}
                  className="w-full border border-white hover:border-green-500 hover:text-green-500 text-gray-100 font-bold py-4 px-6 rounded-full transition-colors mb-4"
                >
                  Connect with Spotify
                </button>
                
                <div className="text-gray-400 text-sm">
                  <p>We'll analyze your top 5 artists, craft 10 perfect matches, and spark your next music obsession.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}