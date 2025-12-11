'use client';

import { useState, useEffect, useRef } from 'react';
import { SpotifyArtist, AITrack } from '../types/spotify';
import toast from 'react-hot-toast';

// Components
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MarqueeSection from '../components/MarqueeSection';
import RecommendationsSection from '../components/RecommendationsSection';
import FeaturedArtists from '../components/FeaturedArtists';
import ArtistSelection from '../components/ArtistSelection';
import ToastProvider from '../components/ToastProvider';

export default function Home() {
  const [featuredArtists, setFeaturedArtists] = useState<SpotifyArtist[]>([]);
  const [userArtists, setUserArtists] = useState<SpotifyArtist[]>([]);
  const [recommendations, setRecommendations] = useState<AITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);
  const [storedTopArtists, setStoredTopArtists] = useState<SpotifyArtist[]>([]);

  useEffect(() => {
    fetchRandomArtists();
    
    // Check for Spotify auth callback
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const artistsData = params.get('artists');
    const artistData = params.get('artist');

    // Restore previous connection from localStorage if present
    const prevConnected = localStorage.getItem('spotify_connected');
    const prevArtists = localStorage.getItem('spotify_top_artists');
    if (prevConnected === 'true' && prevArtists) {
      try {
        const parsed: SpotifyArtist[] = JSON.parse(prevArtists);
        setStoredTopArtists(parsed);
        setConnected(true);
      } catch (e) {
        // ignore
      }
    }

    if (authStatus === 'success') {
      if (artistsData) {
        try {
          const artists: SpotifyArtist[] = JSON.parse(decodeURIComponent(artistsData));
          const toAdd = artists.slice(0, 5);
          setStoredTopArtists(toAdd);
          setUserArtists(prev => {
            const merged = [...toAdd, ...prev].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, 5);
            return merged;
          });
          setConnected(true);
          localStorage.setItem('spotify_connected', 'true');
          localStorage.setItem('spotify_top_artists', JSON.stringify(toAdd));
          toast.success('Connected and your top artists were added!');
        } catch (e) {
          toast.success('Successfully connected to Spotify!');
        }
      } else if (artistData) {
        try {
          const artist: SpotifyArtist = JSON.parse(decodeURIComponent(artistData));
          setStoredTopArtists([artist]);
          setUserArtists(prev => [artist, ...prev].slice(0, 5));
          setConnected(true);
          localStorage.setItem('spotify_connected', 'true');
          localStorage.setItem('spotify_top_artists', JSON.stringify([artist]));
          toast.success(`Connected! Your top artist ${artist.name} has been added!`);
        } catch (e) {
          toast.success('Successfully connected to Spotify!');
        }
      } else {
        toast.success('Successfully connected to Spotify!');
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'unauthorized') {
      toast.error('Your Spotify are authenticated but your Spotify are not whitelisted in this app — please contact the developer bentf24@gmail.com');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      toast.error('Your Spotify are authenticated but your Spotify are not whitelisted in this app — please contact the developer bentf24@gmail.com');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchRandomArtists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/random-artists');
      if (response.ok) {
        const artists: SpotifyArtist[] = await response.json();
        setFeaturedArtists(artists);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load featured artists');
    } finally {
      setLoading(false);
    }
  };

  const addArtist = (artist: SpotifyArtist) => {
    if (userArtists.length >= 5) {
      toast.error('Maximum 5 artists allowed');
      return;
    }
    if (!userArtists.find(a => a.id === artist.id)) {
      setUserArtists(prev => [...prev, artist]);
      toast.success(`Added ${artist.name} to your selection`);
    } else {
      toast.error(`${artist.name} is already in your selection`);
    }
  };

  const removeArtist = (artistId: string) => {
    const artist = userArtists.find(a => a.id === artistId);
    setUserArtists(prev => prev.filter(artist => artist.id !== artistId));
    if (artist) {
      toast.success(`Removed ${artist.name} from your selection`);
    }
  };

  const clearAllArtists = () => {
    if (userArtists.length > 0) {
      setUserArtists([]);
      toast.success('Cleared all artists');
    }
  };

  const generateRecommendations = async () => {
    if (userArtists.length === 0) {
      toast.error('Please add at least one artist');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          artistNames: userArtists.map(artist => artist.name) 
        }),
      });

      if (response.ok) {
        const tracks = await response.json();
        setRecommendations(tracks);
        toast.success('Recommendations generated successfully!');
        
        setTimeout(() => {
          if (recommendationsRef.current) {
            recommendationsRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
          setShowGlow(true);
          setTimeout(() => setShowGlow(false), 2000);
        }, 100);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate recommendations');
      }
    } 
    catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Error generating recommendations');
    } 
    finally {
      setGenerating(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendations([]);
    toast.success('Recommendations cleared');
  };

  const handleSpotifyConnect = (topArtist: SpotifyArtist) => {
    if (topArtist && !userArtists.find(a => a.id === topArtist.id)) {
      setUserArtists(prev => [topArtist, ...prev]);
      toast.success(`Your top artist ${topArtist.name} has been added!`);
    }
  };

  const handleLogout = () => {
    setConnected(false);
    localStorage.removeItem('spotify_connected');
    toast.success('Disconnected from Spotify');
  };

  const handleAutoFill = () => {
    let toUse = storedTopArtists;
    if (!toUse || toUse.length === 0) {
      const fromStorage = localStorage.getItem('spotify_top_artists');
      if (fromStorage) {
        try {
          toUse = JSON.parse(fromStorage);
          setStoredTopArtists(toUse);
        } catch (e) {
          toUse = [];
        }
      }
    }
    if (toUse && toUse.length > 0) {
      setUserArtists(prev => {
        const merged = [...toUse, ...prev].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, 5);
        return merged;
      });
      toast.success('Top artists auto-filled');
    } else {
      toast.error('No stored top artists to add');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastProvider />
      <Header onSpotifyConnect={handleSpotifyConnect} connected={connected} onLogout={() => handleLogout()} onAutoFill={() => handleAutoFill()} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <HeroSection />
        
        <MarqueeSection 
          featuredArtists={featuredArtists}
          onAddArtist={addArtist}
        />

        <RecommendationsSection
          recommendations={recommendations}
          showGlow={showGlow}
          onClearRecommendations={clearRecommendations}
          ref={recommendationsRef}
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <FeaturedArtists
            featuredArtists={featuredArtists}
            userArtists={userArtists}
            loading={loading}
            onAddArtist={addArtist}
            onShuffleArtists={fetchRandomArtists}
          />
          
          <ArtistSelection
            userArtists={userArtists}
            onAddArtist={addArtist}
            onRemoveArtist={removeArtist}
            onClearAllArtists={clearAllArtists}
            onGenerateRecommendations={generateRecommendations}
            generating={generating}
          />
        </div>
      </main>
    </div>
  );
}