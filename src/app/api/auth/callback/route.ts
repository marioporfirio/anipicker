import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const VIEWER_QUERY = `
  query {
    Viewer {
      id
      name
      avatar { large }
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('anilist_oauth_state')?.value;
  cookieStore.delete('anilist_oauth_state');

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }

  try {
    const tokenRes = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.ANILIST_CLIENT_ID,
        client_secret: process.env.ANILIST_CLIENT_SECRET,
        redirect_uri: process.env.ANILIST_REDIRECT_URI,
        code,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Falha ao obter o token de acesso');
    }

    const { access_token } = await tokenRes.json();

    const viewerRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ query: VIEWER_QUERY }),
    });

    if (!viewerRes.ok) throw new Error('Falha ao buscar dados do usuário');

    const { data } = await viewerRes.json();
    const viewer = data.Viewer;

    const ONE_YEAR = 60 * 60 * 24 * 365;
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ONE_YEAR,
      path: '/',
    };

    cookieStore.set('anilist_token', access_token, cookieOpts);
    cookieStore.set(
      'anilist_user',
      JSON.stringify({ id: viewer.id, name: viewer.name, avatar: viewer.avatar.large }),
      { ...cookieOpts, httpOnly: false }
    );

    return NextResponse.redirect(new URL('/?auth=success', request.url));
  } catch (err) {
    console.error('AniList OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }
}
