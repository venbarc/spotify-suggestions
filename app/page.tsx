"use client";

import { useState, useEffect } from 'react';
import { SpotifyArtist } from '../types/spotify';

export default function Home() {
  const [featuredArtists, setFeaturedArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch random artists on component mount
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-green-400">SpotyTaste</h1>
          <p className="text-white font-semibold mt-2">
            Discover your next favorite music based on your taste..
          </p>
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
            Connect your Spotify and get 10 personalized song suggestions based on your top 3 artists
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
                <h4 className="font-semibold mb-2">Analyze Top 3</h4>
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
          
          {/* Left Column - Featured Artists */}
          <div className="bg-spotify-darkgray rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Featured Artists</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {loading ? (
                // Loading state
                <>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-spotify-gray rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-3 animate-pulse"></div>
                      <p className="font-semibold text-sm">Loading...</p>
                      <p className="text-xs text-gray-400">Artist</p>
                    </div>
                  ))}
                </>
              ) : featuredArtists.length > 0 ? (
                // Display actual artists
                featuredArtists.map((artist) => (
                  <div key={artist.id} className="bg-spotify-gray rounded-lg p-4 text-center hover:bg-spotify-lightgray transition-colors">
                    <img 
                      src={artist.images[0]?.url || '/placeholder-artist.jpg'} 
                      alt={artist.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                  <div className="relative group">
                    <p className="font-semibold text-sm cursor-pointer">
                      {artist.name.length > 10 ? `${artist.name.substring(0, 10)}..` : artist.name}
                    </p>
                    {artist.name.length > 10 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-spotify-green text-black text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap pointer-events-none shadow-lg font-medium">
                        {artist.name}
                        {/* Tooltip arrow */}
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
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-spotify-gray rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-3"></div>
                      <p className="font-semibold text-sm">No artists found</p>
                      <p className="text-xs text-gray-400">Try again</p>
                    </div>
                  ))}
                </>
              )}
            </div>
            <button 
              onClick={fetchRandomArtists}
              disabled={loading}
              className="w-full bg-spotify-gray hover:bg-spotify-green hover:text-green-500 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Shuffle Artists'}
            </button>
          </div>

          {/* Right Column - Login/Get Started */}
          <div className="bg-spotify-darkgray rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-white">Get Started</h3>
            <p className="text-gray-300 mb-6">
              Connect your Spotify account to see your top artists and get personalized recommendations
            </p>
            
            <button className="w-full border border-white hover:border-green-500 hover:text-green-500 text-gray-100 font-bold py-4 px-6 rounded-full transition-colors mb-4">
              Connect with Spotify
            </button>
            
            <div className="text-gray-400 text-sm">
              <p>We'll analyze your top 3 artists, craft 10 perfect matches, and spark your next music obsession.</p>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}