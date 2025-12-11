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

  useEffect(() => {
    fetchRandomArtists();
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

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastProvider />
      <Header onSpotifyConnect={handleSpotifyConnect} />

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