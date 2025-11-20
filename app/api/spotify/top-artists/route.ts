import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('spotify_auth='));
    if (!match) return new Response(JSON.stringify([]), { status: 401 });

    const raw = decodeURIComponent(match.replace('spotify_auth=', ''));
    const tokenObj = JSON.parse(raw);
    const accessToken = tokenObj.access_token;
    if (!accessToken) return new Response(JSON.stringify([]), { status: 401 });

    const res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to fetch top artists', text);
      return new Response(JSON.stringify([]), { status: res.status });
    }

    const data = await res.json();
    // Map to your SpotifyArtist type shape
    const artists = (data.items || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      images: a.images || [],
      uri: a.uri,
    }));

    return NextResponse.json(artists);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}