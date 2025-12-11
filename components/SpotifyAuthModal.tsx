'use client';

import { useEffect, useState } from 'react';
import { SpotifyArtist } from '../types/spotify';

interface SpotifyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthorized: boolean;
  onAuthSuccess?: (topArtist?: SpotifyArtist) => void;
}

export default function SpotifyAuthModal({ 
  isOpen, 
  onClose, 
  isAuthorized,
  onAuthSuccess 
}: SpotifyAuthModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen && !isAuthorized) return;

    // Handle Spotify OAuth callback
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        return;
      }

      if (code && !isAuthorized) {
        setLoading(true);
        try {
          const response = await fetch('/api/auth/spotify-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          if (response.ok && data.authorized) {
            onAuthSuccess?.(data.topArtist);
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => onClose(), 1500);
          } else {
            console.error('Authorization failed:', data.message);
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleCallback();
  }, [isOpen, isAuthorized, onClose, onAuthSuccess]);

  if (!isOpen) return null;

  // Show loading state during auth callback processing
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-linear-to-br from-spotify-darkgray to-black rounded-2xl border border-green-500 border-opacity-30 max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-green-500 to-transparent opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 mb-6">
              <svg className="animate-spin h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
              Connecting...
            </h2>

            <p className="text-gray-300 text-sm md:text-base">
              Verifying your Spotify account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-br from-spotify-darkgray to-black rounded-2xl border border-green-500 border-opacity-30 max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-linear-to-br from-green-500 to-transparent opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          {!isAuthorized ? (
            <>
              {/* Unauthorized State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 5a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Access Restricted
                </h2>

                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
                  <p className="text-red-200 text-sm md:text-base font-medium">
                    Your Spotify account is not registered for this application.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-gray-300 text-sm md:text-base">
                    To unlock the full experience and auto-fill your top artists, please contact the developer.
                  </p>
                  
                  <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-xs md:text-sm mb-2 font-semibold">DEVELOPER EMAIL:</p>
                    <p className="text-green-400 font-mono text-sm md:text-base break-all">
                      contact@developer.com
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Authorized State - Success */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 mb-6 animate-pulse">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
                  Connected!
                </h2>

                <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4 mb-6">
                  <p className="text-green-200 text-sm md:text-base font-medium">
                    Your Spotify account is now connected. Your top artist has been loaded!
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Start Exploring
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
