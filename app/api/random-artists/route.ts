import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '../../../lib/spotify';  

export async function GET() {
  try {
    // Get access token using reusable function
    const accessToken = await getSpotifyAccessToken();

    // Generate random search query (a-z)
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));

    const apiSpotify = process.env.NEXT_PUBLIC_API_SPOTIFY;

    // Fetch random artists
    const artistsResponse = await fetch(
      `${apiSpotify}/v1/search?q=${randomChar}&type=artist&limit=30`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const artistsData = await artistsResponse.json();
    
    if (!artistsResponse.ok) {
      throw new Error(artistsData.error.message || 'Failed to fetch artists');
    }

    return NextResponse.json(artistsData.artists.items);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}