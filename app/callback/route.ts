import { NextRequest, NextResponse } from 'next/server';

// Support comma-separated authorized emails via env var SPOTIFY_AUTHORIZED_EMAIL
// If not set, allow any authenticated Spotify user to connect.
const rawAuthorized = process.env.SPOTIFY_AUTHORIZED_EMAIL || '';
const AUTHORIZED_EMAILS = rawAuthorized
  ? rawAuthorized.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : null;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Redirect back to home with error
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${request.nextUrl.origin}/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      }).toString()
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/?error=profile_failed', request.url));
    }

    const userData = await userResponse.json();
    const userEmail = (userData.email || '').toLowerCase();

    // If AUTHORIZED_EMAILS is set (non-null), enforce whitelist; otherwise allow all users
    if (AUTHORIZED_EMAILS && AUTHORIZED_EMAILS.length > 0) {
      const isAuthorized = AUTHORIZED_EMAILS.includes(userEmail);
      if (!isAuthorized) {
        return NextResponse.redirect(new URL('/?auth=unauthorized', request.url));
      }
    }

    // Get user's top artists (up to 5)
    const topArtistsResponse = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=5',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!topArtistsResponse.ok) {
      return NextResponse.redirect(new URL('/?auth=success', request.url));
    }

    const topArtistsData = await topArtistsResponse.json();
    const topItems = topArtistsData.items || [];

    if (topItems.length > 0) {
      // Map to the frontend's expected SpotifyArtist shape
      const artists = topItems.map((a: any) => ({
        id: a.id,
        name: a.name,
        images: (a.images || []).map((img: any) => ({ url: img.url })),
        genres: a.genres || [],
        popularity: a.popularity || 0
      }));

      const artistsData = encodeURIComponent(JSON.stringify(artists));
      return NextResponse.redirect(new URL(`/?auth=success&artists=${artistsData}`, request.url));
    }

    return NextResponse.redirect(new URL('/?auth=success', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
