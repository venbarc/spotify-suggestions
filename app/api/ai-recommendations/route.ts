import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '../../../lib/spotify';
import { AITrack } from '../../../types/spotify';

// Define the interface for Spotify track data
interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  album: {
    images: { url: string }[];
  };
}

export async function POST(request: Request) {
  try {
    const { artistNames } = await request.json();
    
    if (!artistNames || !Array.isArray(artistNames) || artistNames.length === 0) {
      return NextResponse.json({ error: 'Artist names array is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error('Gemini API key missing');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `Generate exactly 10 UNIQUE song recommendations based on these artists: ${artistNames.join(', ')}.

      CRITICAL RULES:
      1. Recommend 2 songs per artist, but if fewer than 5 artists are provided, distribute the 10 songs evenly among the available artists
      2. EVERY SONG MUST BE UNIQUE - NO DUPLICATE SONG NAMES
      3. Focus on LESS POPULAR or UNDERAPPRECIATED songs that are hidden gems, not mainstream hits
      4. Ensure variety - don't recommend the same song multiple times

      Examples:
      - If 5 artists provided: 2 songs per artist = 10 songs total
      - If 3 artists provided: 3-4 songs per artist = 10 songs total
      - If 1 artist provided: 10 different songs from that artist

      Format your response as a JSON array with exactly this structure:
      [
        {
          "name": "Song Name",
          "artist": "Artist Name", 
          "reason": "Brief reason why this is a hidden gem (1 sentence)",
          "year": "Release year"
        }
      ]

      Return ONLY the JSON array, no other text. Make sure it's valid JSON.`;

    const modelEndpoints = [
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
    ];

    let lastError = null;

    for (const model of modelEndpoints) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.9, // Increased for more variety
                topP: 0.95,
                topK: 50,
                maxOutputTokens: 2048,
              }
            }),
          }
        );

        const data = await response.json();
        
        if (response.ok) {
          console.log(`Success with model: ${model}`);
          
          if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response structure:', data);
            continue;
          }

          const aiResponse = data.candidates[0].content.parts[0].text;
          console.log('Raw AI response:', aiResponse);
          
          try {
            const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
            console.log('Cleaned response:', cleanedResponse);
            
            let recommendations: AITrack[] = JSON.parse(cleanedResponse);
            
            if (!Array.isArray(recommendations) || recommendations.length === 0) {
              throw new Error('Invalid recommendations format');
            }

            // Remove duplicates before processing
            recommendations = removeDuplicateSongs(recommendations);
            
            console.log('Successfully parsed recommendations:', recommendations.length);
            
            // Search Spotify for each track
            const tracksWithSpotifyData = await Promise.all(
              recommendations.map(async (track: AITrack) => {
                try {
                  const spotifyTrack = await searchSpotifyTrack(track.name, track.artist);
                  return {
                    ...track,
                    preview_url: spotifyTrack?.preview_url || null,
                    spotify_id: spotifyTrack?.id || null,
                    external_url: spotifyTrack?.external_urls?.spotify || null,
                    image_url: spotifyTrack?.album?.images[0]?.url || null
                  };
                } catch (error) {
                  console.error(`Error searching for ${track.name}:`, error);
                  return {
                    ...track,
                    preview_url: null,
                    spotify_id: null,
                    external_url: null,
                    image_url: null
                  };
                }
              })
            );
            
            return NextResponse.json(tracksWithSpotifyData);
            
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            try {
              const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                let recommendations: AITrack[] = JSON.parse(jsonMatch[0]);
                if (Array.isArray(recommendations) && recommendations.length > 0) {
                  console.log('Successfully extracted JSON from response');
                  
                  // Remove duplicates
                  recommendations = removeDuplicateSongs(recommendations);
                  
                  const tracksWithSpotifyData = await Promise.all(
                    recommendations.map(async (track: AITrack) => {
                      try {
                        const spotifyTrack = await searchSpotifyTrack(track.name, track.artist);
                        return {
                          ...track,
                          preview_url: spotifyTrack?.preview_url || null,
                          spotify_id: spotifyTrack?.id || null,
                          external_url: spotifyTrack?.external_urls?.spotify || null,
                          image_url: spotifyTrack?.album?.images[0]?.url || null
                        };
                      } catch (error) {
                        console.error(`Error searching for ${track.name}:`, error);
                        return track;
                      }
                    })
                  );
                  
                  return NextResponse.json(tracksWithSpotifyData);
                }
              }
            } catch (extractError) {
              console.error('Failed to extract JSON from response');
              continue;
            }
          }
        } else {
          lastError = data.error;
          console.log(`Model ${model} failed:`, data.error?.message);
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
      }
    }

    console.error('All model attempts failed');
    return NextResponse.json({ 
      error: 'Failed to get AI recommendations',
      details: lastError?.message || 'All model attempts failed. Please try again.'
    }, { status: 500 });

  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to remove duplicate songs
function removeDuplicateSongs(recommendations: AITrack[]): AITrack[] {
  const seen = new Set<string>();
  const uniqueRecommendations: AITrack[] = [];
  
  for (const track of recommendations) {
    const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRecommendations.push(track);
    } else {
      console.log(`Removed duplicate: ${track.name} by ${track.artist}`);
    }
  }
  
  return uniqueRecommendations;
}

// Helper function to search Spotify for tracks
async function searchSpotifyTrack(trackName: string, artistName: string): Promise<SpotifyTrack | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    const apiSpotify = process.env.NEXT_PUBLIC_API_SPOTIFY;

    if (!apiSpotify) {
      throw new Error('Spotify API URL not configured');
    }

    // Search for the track with both track name and artist
    const searchResponse = await fetch(
      `${apiSpotify}/v1/search?q=${encodeURIComponent(`track:"${trackName}" artist:"${artistName}"`)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed');
    }

    const searchData = await searchResponse.json();
    
    if (searchData.tracks.items.length > 0) {
      return searchData.tracks.items[0];
    }

    // If exact search fails, try a more flexible search
    const flexibleResponse = await fetch(
      `${apiSpotify}/v1/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (flexibleResponse.ok) {
      const flexibleData = await flexibleResponse.json();
      if (flexibleData.tracks.items.length > 0) {
        return flexibleData.tracks.items[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error in searchSpotifyTrack:', error);
    return null;
  }
}