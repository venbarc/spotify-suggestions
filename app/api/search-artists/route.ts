import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '../../../lib/spotify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const accessToken = await getSpotifyAccessToken();
    const apiSpotify = process.env.NEXT_PUBLIC_API_SPOTIFY;

    const response = await fetch(
      `${apiSpotify}/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error.message || 'Failed to search artists');
    }

    return NextResponse.json(data.artists.items);
  } catch (error) {
    console.error('Error searching artists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}