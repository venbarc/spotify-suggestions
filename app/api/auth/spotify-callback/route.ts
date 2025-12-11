import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_EMAILS = [
  process.env.SPOTIFY_AUTHORIZED_EMAIL || 'your-email@example.com'
];

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/spotify-callback';

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
      return NextResponse.json(
        { error: 'Failed to exchange code for token', details: error },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    // Check if user is authorized
    const isAuthorized = AUTHORIZED_EMAILS.includes(userEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: 'User email not authorized',
          userEmail,
          message: 'Please contact the developer to get access'
        },
        { status: 403 }
      );
    }

    // Get user's top artists
    const topArtistsResponse = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!topArtistsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch top artists' },
        { status: 400 }
      );
    }

    const topArtistsData = await topArtistsResponse.json();
    const topArtist = topArtistsData.items?.[0];

    return NextResponse.json({
      success: true,
      authorized: true,
      user: {
        email: userEmail,
        name: userData.display_name,
        profileImage: userData.images?.[0]?.url
      },
      topArtist: topArtist ? {
        id: topArtist.id,
        name: topArtist.name,
        image: topArtist.images?.[0]?.url,
        popularity: topArtist.popularity
      } : null,
      accessToken: accessToken // You might want to hash/secure this
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
