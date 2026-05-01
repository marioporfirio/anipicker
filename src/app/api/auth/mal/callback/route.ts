import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('mal_oauth_state')?.value;
  const codeVerifier = cookieStore.get('mal_code_verifier')?.value;

  cookieStore.delete('mal_oauth_state');
  cookieStore.delete('mal_code_verifier');

  if (!code || !state || state !== savedState || !codeVerifier) {
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }

  try {
    const tokenRes = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.MAL_CLIENT_ID!,
        client_secret: process.env.MAL_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MAL_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Failed to get MAL token: ${tokenRes.status} ${errBody}`);
    }

    const { access_token } = await tokenRes.json();

    const userRes = await fetch('https://api.myanimelist.net/v2/users/@me?fields=picture', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error('Failed to fetch MAL user');

    const user = await userRes.json();

    const ONE_YEAR = 60 * 60 * 24 * 365;
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ONE_YEAR,
      path: '/',
    };

    cookieStore.set('mal_token', access_token, cookieOpts);
    cookieStore.set(
      'mal_user',
      JSON.stringify({ id: user.id, name: user.name, avatar: user.picture ?? null }),
      { ...cookieOpts, httpOnly: false }
    );

    return NextResponse.redirect(new URL('/?auth=mal-success', request.url));
  } catch (err) {
    console.error('MAL OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }
}
